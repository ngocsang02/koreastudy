// Guest and each authenticated user have independent caches. Only queued changes
// are uploaded, so an old device cannot overwrite unrelated cloud progress.
export class ProgressStore {
  constructor(ids, storage = globalThis.localStorage) {
    this.ids = new Set(ids);
    this.storage = storage;
    this.userId = null;
    this.adapter = null;
    this.listeners = new Set();
    this.generation = 0;
    this.inflight = null;
    this.load();
  }
  get key() { return `hanul-progress-v2:${this.userId || 'guest'}`; }
  load() {
    this.rows = {}; this.pending = {}; this.status = 'local';
    try {
      const cached = JSON.parse(this.storage.getItem(this.key) || 'null');
      if (cached) {
        for (const [id, row] of Object.entries(cached.rows || {})) {
          if (this.ids.has(id)) this.rows[id] = { saved: row.saved === true, learned: row.learned === true };
        }
        for (const [id, row] of Object.entries(cached.pending || {})) {
          if (this.ids.has(id)) this.pending[id] = { saved: row.saved === true, learned: row.learned === true };
        }
      } else if (!this.userId) {
        // Preserve progress from the original static website on the same origin.
        for (const [key, field] of [['hanul-saved-v1','saved'], ['hanul-learned-v1','learned']]) {
          const values = JSON.parse(this.storage.getItem(key) || '[]');
          if (Array.isArray(values)) for (const id of values) if (this.ids.has(id)) {
            this.rows[id] = { saved: false, learned: false, ...this.rows[id], [field]: true };
          }
        }
      }
    } catch { this.status = 'storage-error'; }
  }
  snapshot() {
    return { saved: Object.keys(this.rows).filter(id => this.rows[id].saved), learned: Object.keys(this.rows).filter(id => this.rows[id].learned), status: this.status, userId: this.userId };
  }
  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit() { for (const fn of this.listeners) fn(this.snapshot()); }
  save() {
    try { this.storage.setItem(this.key, JSON.stringify({rows:this.rows,pending:this.pending})); }
    catch { this.status = 'storage-error'; }
    this.emit();
  }
  update(saved, learned) {
    const s = new Set(saved), l = new Set(learned);
    for (const id of this.ids) {
      const next = {saved:s.has(id), learned:l.has(id)};
      const prev = this.rows[id] || {saved:false,learned:false};
      if (next.saved !== prev.saved || next.learned !== prev.learned) {
        this.rows[id] = next;
        if (this.userId) this.pending[id] = next;
      }
    }
    this.save();
    if (this.userId) void this.sync();
  }
  async connect(userId, adapter) {
    if (this.userId === userId && this.adapter === adapter) return;
    this.generation++; this.inflight = null;
    this.userId = userId; this.adapter = adapter;
    this.load(); this.emit();
    if (userId) await this.sync();
  }
  async sync() {
    if (!this.userId || !this.adapter) return;
    if (this.inflight) return this.inflight;
    const generation = this.generation, uid = this.userId, adapter = this.adapter;
    this.status = 'syncing'; this.emit();
    const active = () => generation === this.generation;
    this.inflight = (async () => {
      try {
        // Repeat if the learner edits a row while its previous value is uploading.
        while (active() && Object.keys(this.pending).length) {
          const batch = {...this.pending};
          await adapter.push(uid, batch);
          if (!active()) return;
          for (const [id,row] of Object.entries(batch)) if (this.pending[id] === row) delete this.pending[id];
          this.save();
        }
        const cloud = await adapter.pull(uid);
        if (!active()) return;
        const merged = {};
        for (const row of cloud) if (this.ids.has(row.grammar_id)) merged[row.grammar_id] = {saved:row.saved===true,learned:row.learned===true};
        this.rows = {...merged, ...this.pending};
        this.status = Object.keys(this.pending).length ? 'pending' : 'synced';
        this.save();
      } catch {
        if (active()) { this.status = 'sync-error'; this.save(); }
      } finally {
        if (active()) {
          this.inflight = null;
          if (this.status === 'pending') void this.sync();
        }
      }
    })();
    return this.inflight;
  }
}
