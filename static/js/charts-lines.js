/**
 * For usage, visit Chart.js docs https://www.chartjs.org/docs/latest/
 */
const lineConfig = {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: 'Registros por día',
        backgroundColor: '#0694a2',
        borderColor: '#0694a2',
        data: [], // Conteos se agregarán dinámicamente
        fill: false,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Fecha',
        },
      },
      y: {
        title: {
          display: true,
          labelString: 'Value',
          text: 'Cantidad de registros',
        },
      },
    },
  },
};

// Asigna el canvas donde se generará el gráfico
const lineCtx = document.getElementById('line');
window.myLine = new Chart(lineCtx, lineConfig);


const countCommentsByDay = (data) => {
  const countsByDate = {};

  Object.values(data).forEach((record) => {
    const savedTime = record.saved;
    if (!savedTime) return; // Ignora entradas sin fecha

    try {
      // Reemplaza caracteres problemáticos y ajusta formato
      let formattedTime = savedTime
        .replace('\xa0', ' ') // Reemplaza espacio no divisible
        .replace('a. m.', ' AM')
        .replace('p. m.', ' PM')
        .replace(',', ''); // Eliminar la coma

      console.log("Fecha Formateada: ", formattedTime); // Para verificar el formato

      // Ahora dividimos la fecha y la hora
      const dateParts = formattedTime.split(' '); // Divide la fecha de la hora
      const date = dateParts[0].split('/'); // Divide día, mes, año
      const time = dateParts[1]; // Extrae la hora en formato HH:MM:SS

      // Asegurarse de que la hora esté en formato de 24 horas
      let hours = time.split(':')[0];
      let minutes = time.split(':')[1];
      let seconds = time.split(':')[2];

      // Ajustamos la hora en función del AM/PM
      const period = dateParts[2]; // AM o PM
      if (period === 'PM' && hours !== '12') {
        hours = (parseInt(hours) + 12).toString(); // Convertir PM a formato de 24 horas
      }
      if (period === 'AM' && hours === '12') {
        hours = '00'; // 12 AM se convierte en 00
      }

      // Creamos el string de la fecha en formato ISO 8601: YYYY-MM-DD HH:MM:SS
      const isoDate = `${date[2]}-${date[1]}-${date[0]} ${hours}:${minutes}:${seconds}`;

      // Intentamos crear el objeto Date con el formato ISO
      const dt = new Date(isoDate);

      if (isNaN(dt.getTime())) {
        throw new Error("Fecha inválida :("); // Si la fecha no es válida, lanza un error
      }

      const dateKey = dt.toISOString().split('T')[0]; // Extrae "YYYY-MM-DD"
      countsByDate[dateKey] = (countsByDate[dateKey] || 0) + 1;
    } catch (error) {
      console.error("Error procesando fecha .-. :", savedTime, error);
    }
  });

  const labels = Object.keys(countsByDate).sort(); // Ordena las fechas
  const counts = labels.map((label) => countsByDate[label]); // Obtiene conteos por fecha

  return { labels, counts };
};

const update = () => {
  fetch('/api/v1/landing') // Reemplaza con la ruta correcta para tu API
    .then((response) => response.json())
    .then((data) => {
      console.log("Datos obtenidos:", data);

      const { labels, counts } = countCommentsByDay(data);

      console.log("Fechas procesadas:", labels, "Conteos:", counts);

      // Actualiza los datos del gráfico
      window.myLine.data.labels = [...labels];
      window.myLine.data.datasets[0].data = [...counts];

      window.myLine.update(); // Refresca el gráfico
    })
    .catch((error) => console.error("Error en la actualización:", error));
};

// Llamada inicial para cargar los datos
update();