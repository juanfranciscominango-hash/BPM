import json

with open('screen19_db.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

new_tab = {
  "title": "Referencias",
  "sections": [
    {
      "title": "Referencias Personales y Familiares",
      "fields": [
        {
          "name": "referencias_personales",
          "label": "Referencias Personales",
          "controlType": "GRID",
          "cols": 12,
          "required": False,
          "readOnly": False,
          "defaultValue": "",
          "config": {
            "selectedColumns": [
              { "name": "nombres", "label": "Apellidos y nombres", "type": "string" },
              { "name": "parentesco", "label": "Parentesco", "type": "string" },
              { "name": "telefono_fijo", "label": "Teléfono Fijo", "type": "string" },
              { "name": "telefono_celular", "label": "Teléfono Celular", "type": "string" },
              { "name": "ciudad", "label": "Provincia/Ciudad", "type": "string" }
            ],
            "allowDelete": True,
            "allowAdd": True
          }
        },
        {
          "name": "referencias_familiares",
          "label": "Referencias Familiares",
          "controlType": "GRID",
          "cols": 12,
          "required": False,
          "readOnly": False,
          "defaultValue": "",
          "config": {
            "selectedColumns": [
              { "name": "nombres", "label": "Apellidos y nombres", "type": "string" },
              { "name": "parentesco", "label": "Parentesco", "type": "string" },
              { "name": "telefono_fijo", "label": "Teléfono Fijo", "type": "string" },
              { "name": "telefono_celular", "label": "Teléfono Celular", "type": "string" },
              { "name": "ciudad", "label": "Provincia/Ciudad", "type": "string" }
            ],
            "allowDelete": True,
            "allowAdd": True
          }
        }
      ]
    },
    {
      "title": "Referencias Bancarias",
      "fields": [
        {
          "name": "referencias_bancarias",
          "label": "Referencias bancarias",
          "controlType": "GRID",
          "cols": 12,
          "required": False,
          "readOnly": False,
          "defaultValue": "",
          "config": {
            "selectedColumns": [
              { "name": "tipo_ref", "label": "Tipo Ref. Bancaria", "type": "string" },
              { "name": "institucion", "label": "Institución", "type": "string" },
              { "name": "no_cuenta", "label": "No. Cuenta/Tarjeta", "type": "string" },
              { "name": "tipo_cuenta", "label": "Tipo de cuenta", "type": "string" }
            ],
            "allowDelete": True,
            "allowAdd": True
          }
        }
      ]
    }
  ]
}

data['tabs'].append(new_tab)

with open('screen19_db_updated.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False)
