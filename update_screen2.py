import json

with open('screen19_db_updated.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# The tabs are at data['tabs']
# The last tab is 'Referencias'
referencias_tab = data['tabs'][-1]
sections = referencias_tab['sections']

# Section 0: Referencias Personales y Familiares
ref_pers_fam = sections[0]
fields = ref_pers_fam['fields']

# modify parentesco column for both
for grid in fields:
    cols = grid['config']['selectedColumns']
    for col in cols:
        if col['name'] == 'parentesco':
            col['type'] = 'PARAMETRICA'
            col['parametricTableId'] = 30
            col['displayField'] = 'descripcion'

with open('screen19_db_updated2.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False)
