document.addEventListener("DOMContentLoaded", function () {
    const crearNuevoBtn = document.getElementById("crearNuevo");

    crearNuevoBtn.addEventListener("click", function() {
        window.location.href = "bitacora.html";
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const tablaActividades = document.getElementById("tablaActividades");
    const finalizarBitacoraBtn = document.getElementById("finalizarBitacora");
    const tablaTiempos = document.getElementById("tablaTiempos").querySelector("tbody");

    // Solicitar permiso de notificación
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    // Actividades predefinidas
    const actividadesPredefinidas = [
        "Planificacion", "Analisis", "Codificacion", "Pruebas", "Lanzamiento",
        "Revision", "Revision de Codigo", "Diagramar", "Reunion"
    ];

    // Agregar filas para actividades predefinidas
    actividadesPredefinidas.forEach(actividad => agregarFila(actividad));

    function agregarFila(nombreActividad) {
        if (nombreActividad) {
            const fechaActual = new Date().toISOString().split("T")[0];
            const nuevaFila = document.createElement("tr");

            nuevaFila.innerHTML = `
                <td><input type="date" value="${fechaActual}" readonly></td>
                <td><input type="time" class="inicio"></td>
                <td><input type="time" class="fin"></td>
                <td><input type="number" min="0" class="interrupcion" readonly></td>
                <td><input type="text" class="tiempo" readonly></td>
                <td><input type="text" value="${nombreActividad}" readonly></td>
                <td><input type="text"></td>
                <td><span class="reloj">00:00:00</span></td>
                <td><span class="horaActual">00:00:00</span></td>
                <td>
                    <button class="iniciarTiempo">Iniciar Tiempo</button>
                    <button class="pausarTiempo" disabled>Pausar Tiempo</button>
                    <button class="pararTiempo" disabled>Parar Tiempo</button>
                </td>
            `;

            tablaActividades.appendChild(nuevaFila);

            const inputInicio = nuevaFila.querySelector(".inicio");
            const inputFin = nuevaFila.querySelector(".fin");
            const inputInterrupcion = nuevaFila.querySelector(".interrupcion");
            const inputTiempo = nuevaFila.querySelector(".tiempo");
            const reloj = nuevaFila.querySelector(".reloj");
            const horaActualSpan = nuevaFila.querySelector(".horaActual");
            const iniciarTiempoBtn = nuevaFila.querySelector(".iniciarTiempo");
            const pausarTiempoBtn = nuevaFila.querySelector(".pausarTiempo");
            const pararTiempoBtn = nuevaFila.querySelector(".pararTiempo");

            let intervalId;
            let startTime;
            let elapsedTime = 0;

            iniciarTiempoBtn.addEventListener("click", function() {
                if (!inputInicio.value) {
                    inputInicio.value = new Date().toISOString().slice(11, 19);
                    iniciarTiempoBtn.disabled = true;
                    pausarTiempoBtn.disabled = false;
                    pararTiempoBtn.disabled = false;
                    clearInterval(intervalId);
                    startClock(reloj, horaActualSpan);
                }
            });

            let tiempoPausaInicio = null;
            let totalTiempoPausa = 0;

            pausarTiempoBtn.addEventListener("click", function() {
                if (pausarTiempoBtn.textContent === "Pausar Tiempo") {
                    clearInterval(intervalId);
                    pausarTiempoBtn.textContent = "Reanudar Tiempo";
                    tiempoPausaInicio = new Date();
                } else {
                    pausarTiempoBtn.textContent = "Pausar Tiempo";
                    if (tiempoPausaInicio) {
                        let tiempoPausaFin = new Date();
                        let diferenciaMinutos = Math.floor((tiempoPausaFin - tiempoPausaInicio) / (1000 * 60));
                        totalTiempoPausa += diferenciaMinutos;
                        inputInterrupcion.value = totalTiempoPausa || 0; // Asegúrate de que el valor sea válido
                        tiempoPausaInicio = null;
                    }
                    startClock(reloj, horaActualSpan);
                }
            });

            pararTiempoBtn.addEventListener("click", function() {
                clearInterval(intervalId);
                const finTime = new Date().toISOString().slice(11, 19);
                inputFin.value = finTime;
                iniciarTiempoBtn.disabled = false;
                pausarTiempoBtn.disabled = true;
                pararTiempoBtn.disabled = true;

                const [inicioHoras, inicioMinutos, inicioSegundos] = inputInicio.value.split(':').map(Number);
                const [finHoras, finMinutos, finSegundos] = inputFin.value.split(':').map(Number);
                const inicio = new Date();
                inicio.setHours(inicioHoras, inicioMinutos, inicioSegundos);
                const fin = new Date();
                fin.setHours(finHoras, finMinutos, finSegundos);

                let tiempoTotal = (fin - inicio) / (1000 * 60); // Diferencia en minutos

                const interrupcion = parseInt(inputInterrupcion.value) || 0;
                tiempoTotal -= interrupcion;

                inputTiempo.value = tiempoTotal > 0 ? `${tiempoTotal} min` : "0 min";
            });

            inputFin.addEventListener("change", function() {
                clearInterval(intervalId);
                pausarTiempoBtn.disabled = true;
                iniciarTiempoBtn.disabled = false;
                pararTiempoBtn.disabled = true;
            });

            function startClock(reloj, horaActualSpan) {
                startTime = new Date() - elapsedTime;

                intervalId = setInterval(function() {
                    let currentTime = new Date();
                    elapsedTime = currentTime - startTime;

                    let hours = Math.floor(elapsedTime / 3600000);
                    let minutes = Math.floor((elapsedTime % 3600000) / 60000);
                    let seconds = Math.floor((elapsedTime % 60000) / 1000);

                    reloj.textContent = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
                    horaActualSpan.textContent = currentTime.toLocaleTimeString();

                    if (minutes >= 1 && seconds === 0) {
                        mostrarNotificacion();
                        reproducirAlarma();
                    }
                }, 1000);
            }

            function pad(number) {
                return number < 10 ? "0" + number : number;
            }

            function mostrarNotificacion() {
                if (Notification.permission === "granted") {
                    new Notification("¡Aviso!", { body: "Pare de hacer esta actividad" });
                } else if (Notification.permission !== "denied") {
                    Notification.requestPermission().then(permission => {
                        if (permission === "granted") {
                            new Notification("¡Aviso!", { body: "Pare de hacer esta actividad" });
                        }
                    });
                }
            }

            function reproducirAlarma() {
                const audio = new Audio('alarma.mp3');
                audio.play();
                mostrarNotificacion();
            }

            inputInicio.addEventListener("change", calcularTiempo);
            inputFin.addEventListener("change", calcularTiempo);
            inputInterrupcion.addEventListener("input", calcularTiempo);

            function calcularTiempo() {
                // Asegúrate de que el valor de interrupciones sea válido
                if (!inputInterrupcion.value || isNaN(inputInterrupcion.value)) {
                    inputInterrupcion.value = 0;
                }

                if (inputInicio.value && inputFin.value) {
                    const [inicioHoras, inicioMinutos, inicioSegundos] = inputInicio.value.split(':').map(Number);
                    const [finHoras, finMinutos, finSegundos] = inputFin.value.split(':').map(Number);
                    const inicio = new Date();
                    inicio.setHours(inicioHoras, inicioMinutos, inicioSegundos);
                    const fin = new Date();
                    fin.setHours(finHoras, finMinutos, finSegundos);

                    let tiempoTotal = (fin - inicio) / (1000 * 60); // Diferencia en minutos

                    const interrupcion = parseInt(inputInterrupcion.value) || 0;
                    tiempoTotal -= interrupcion;

                    inputTiempo.value = tiempoTotal > 0 ? `${tiempoTotal} min` : "0 min";
                } else {
                    inputTiempo.value = "";
                }
            }
        }
    }

    finalizarBitacoraBtn.addEventListener("click", function() {
        const filas = document.querySelectorAll("#tablaActividades tr");

        // Finalizar todas las actividades en curso
        filas.forEach((fila) => {
            const pararTiempoBtn = fila.querySelector(".pararTiempo");
            if (!pararTiempoBtn.disabled) {
                pararTiempoBtn.click();
            }
        });

        const actividades = [];

        filas.forEach((fila) => {
            const actividad = fila.cells[5].querySelector("input").value;
            const tiempo = parseFloat(fila.cells[4].querySelector("input").value);
            const interrupcion = parseFloat(fila.cells[3].querySelector("input").value) || 0;
            if (actividad && tiempo) {
                actividades.push({ actividad, tiempo, interrupcion });
            }
        });

        generarGrafico(actividades);
        mostrarTiempos(actividades);
        generarPDF(actividades);
    });

    function generarGrafico(actividades) {
        const ctx = document.getElementById("miGrafico").getContext("2d");
        const etiquetas = actividades.map(a => a.actividad);
        const tiempos = actividades.map(a => a.tiempo);

        new Chart(ctx, {
            type: "bar",
            data: {
                labels: etiquetas,
                datasets: [{
                    label: "Tiempo en minutos",
                    data: tiempos,
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderColor: "rgba(75, 192, 192, 1)",
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function mostrarTiempos(actividades) {
        tablaTiempos.innerHTML = ''; // Limpiar la tabla antes de agregar nuevas filas

        actividades.forEach(({ actividad, tiempo, interrupcion }) => {
            const tiempoEfectivo = tiempo;
            const tiempoMuerto = interrupcion;

            const nuevaFila = document.createElement("tr");
            nuevaFila.innerHTML = `
                <td>${actividad}</td>
                <td>${tiempoEfectivo}</td>
                <td>${tiempoMuerto}</td>
            `;

            tablaTiempos.appendChild(nuevaFila);
        });
    }

    function generarPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
    
        // Capturar la tabla de actividades
        html2canvas(document.querySelector("#tablaActividades")).then(canvas => {
            const imgData = canvas.toDataURL("image/png");
            const imgWidth = 190; // Ancho de la imagen en el PDF
            const pageHeight = 295; // Altura de la página en el PDF
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight;
            let position = 10;
    
            doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
    
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                doc.addPage();
                doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
    
            // Capturar el gráfico
            html2canvas(document.querySelector("#miGrafico")).then(canvas => {
                const imgData = canvas.toDataURL("image/png");
                const imgWidth = 190; // Ancho de la imagen en el PDF
                const imgHeight = canvas.height * imgWidth / canvas.width;
                let position = heightLeft > 0 ? heightLeft + 10 : 10;
    
                doc.addPage();
                doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    
                // Capturar la tabla de tiempos
                html2canvas(document.querySelector("#tablaTiempos")).then(canvas => {
                    const imgData = canvas.toDataURL("image/png");
                    const imgWidth = 190; // Ancho de la imagen en el PDF
                    const imgHeight = canvas.height * imgWidth / canvas.width;
                    let position = heightLeft > 0 ? heightLeft + 10 : 10;
    
                    doc.addPage();
                    doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    
                    doc.save("reporte_actividades.pdf");
                });
            });
        });
    }
});