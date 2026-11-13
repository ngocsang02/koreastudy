"""Read source XLSX directly, including native threaded comments. No workbook edits."""
import json, re, unicodedata, zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

BASE = Path(__file__).resolve().parents[1]
source = next(BASE.parent.glob('*.xlsx'))
ns = {'s': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
with zipfile.ZipFile(source) as z:
    strings = [''.join(x.itertext()) for x in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('s:si', ns)]
    sheet = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
    comments = {}
    # Native threads avoid the compatibility warning added to legacy comments.
    for name in z.namelist():
        if name.startswith('xl/threadedComments/') and name.endswith('.xml'):
            for c in ET.fromstring(z.read(name)):
                ref = c.get('ref')
                if ref:
                    text = '\n'.join(x.text or '' for x in c if x.tag.endswith('}text'))
                    comments.setdefault(ref, []).append(unicodedata.normalize('NFC', text.strip()))
    records = []
    context = {'A': '', 'B': '', 'C': ''}
    for row in sheet.findall('.//s:row', ns):
        if row.get('r') == '1':
            continue
        cells = {}
        for c in row.findall('s:c', ns):
            v = c.find('s:v', ns)
            value = (strings[int(v.text)] if c.get('t') == 's' else v.text or '') if v is not None else ''.join(c.find('s:is', ns).itertext()) if c.find('s:is', ns) is not None else ''
            cells[re.sub(r'\d+', '', c.get('r'))] = unicodedata.normalize('NFC', value.strip())
        for key in context:
            if cells.get(key): context[key] = cells[key]
        if not cells.get('E'): continue
        ref = 'E' + row.get('r')
        records.append({'id': ref, 'book': context['A'], 'lesson': context['B'], 'topic': context['C'], 'vocabulary': cells.get('D', ''), 'grammar': cells['E'], 'note': '\n\n'.join(comments.get(ref, []))})
    result = {'source': source.name, 'sheet': 'Tiếng Hàn Tổng Hợp', 'items': records}
    (BASE / 'src/data.js').write_text('window.HANUL_DATA = ' + json.dumps(result, ensure_ascii=False) + ';\n', encoding='utf-8')
    print(json.dumps({'records': len(records), 'with_notes': sum(bool(r['note']) for r in records), 'books': sorted(set(r['book'] for r in records)), 'lessons': len(set(r['lesson'] for r in records))}, ensure_ascii=False))
