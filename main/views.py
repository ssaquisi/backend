from datetime import datetime
from collections import Counter
from django.shortcuts import render

# Importe requests y json
import requests
import json

# Create your views here.
from django.http import HttpResponse

# Importe el decorador login_required
from django.contrib.auth.decorators import login_required, permission_required

# Restricción de acceso con @login_required
@login_required
@permission_required('main.index_viewer', raise_exception=True)
def index(request):
    #return HttpResponse("Hello, World!")
    #return render(request, 'main/base.html')

    # Arme el endpoint del REST API
    current_url = request.build_absolute_uri()
    url = current_url+'/api/v1/landing'

    # Petición al REST API
    response_http = requests.get(url)
    response_dict = json.loads(response_http.content)

    print("Endpoint ", url)
    print("Response ", response_dict)

    # Respuestas totales
    total_responses = len(response_dict.keys())

    # Valores de la respuesta
    responses = response_dict.values()
    first_responses = list(response_dict.values())[0]['saved']
    last_responses = list(response_dict.values())[-1]['saved']
    
    #dias con mas respuestas
    def obtener_dia_con_mas_registros(response_dict):
        dias = []
        for key, value in response_dict.items():
            fecha_str = value['saved'].split(',')[0]
            fecha = datetime.strptime(fecha_str, '%d/%m/%Y')
            dia = fecha.strftime('%d/%m/%Y')
            dias.append(dia)

        # Contar cuántas veces aparece cada día
        contador_dias = Counter(dias)

        # Obtener el día con más registros
        dia_mas_registros = contador_dias.most_common(1)[0] # Retorna una lista con el día y su cantidad

        return dia_mas_registros[0]

    #day_max_res=obtener_dia_con_mas_registros(response_dict)

    high_rate_responses = str(obtener_dia_con_mas_registros(response_dict))
    
    # Objeto con los datos a renderizar
    data = {
        'title': 'Landing - Dashboard',
        'total_responses': total_responses,
        'responses': responses,
        'first_responses': first_responses,
        'last_responses': last_responses,
        'high_rate_responses': high_rate_responses
    }

    # Renderización en la plantilla
    return render(request, 'main/index.html', data)