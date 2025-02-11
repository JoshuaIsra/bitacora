document.addEventListener("DOMContentLoaded", function () {
    const nuevaActividadBtn = document.getElementById("nuevaActividad");
    const tablaActividades = document.getElementById("tablaActividades");
    const modal = document.getElementById("modal");
    const span = document.getElementsByClassName("close")[0];
    const guardarActividadBtn = document.getElementById("guardarActividad");
    let nombreActividadInput = document.getElementById("nombreActividad");
    const finalizarBitacoraBtn = document.getElementById("finalizarBitacora");

    // Solicitar permiso de notificación
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    // Mostrar modal
    nuevaActividadBtn.addEventListener("click", mostrarModal);

    function mostrarModal() {
        modal.style.display = "block";
    }

    // Cerrar modal
    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Guardar actividad y agregar fila
    guardarActividadBtn.addEventListener("click", function() {
        agregarFila(nombreActividadInput.value);
        modal.style.display = "none";
        nombreActividadInput.value = "";
    });

    function agregarFila(nombreActividad) {
        if (nombreActividad) {
            const fechaActual = new Date().toISOString().split("T")[0];
            const nuevaFila = document.createElement("tr");

            nuevaFila.innerHTML = `
                <td><input type="date" value="${fechaActual}" readonly></td>
                <td><input type="time" class="inicio"></td>
                <td><input type="time" class="fin"></td>
                <td><input type="number" min="0" class="interrupcion"></td>
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

            // let tiempoPausaInicio = null;
            // let totalTiempoPausa= 0;
            pausarTiempoBtn.addEventListener("click", function() {
                if (pausarTiempoBtn.textContent === "Pausar Tiempo") {
                    clearInterval(intervalId);
                    pausarTiempoBtn.textContent = "Reanudar Tiempo";
                } else {
                    pausarTiempoBtn.textContent = "Pausar Tiempo";
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

                // Restar interrupciones si existen
                const interrupcion = parseInt(inputInterrupcion.value) || 0;
                tiempoTotal -= interrupcion;

                // Asegurar que el tiempo no sea negativo
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
                    }
                }, 1000);
            }

            function pad(number) {
                return number < 10 ? "0" + number : number;
            }

            function mostrarNotificacion() {
                if (Notification.permission === "granted") {
                    new Notification("¡Aviso!", { body: "El tiempo en el reloj ha alcanzado los 60 minutos." });
                } else if (Notification.permission !== "denied") {
                    Notification.requestPermission().then(permission => {
                        if (permission === "granted") {
                            new Notification("¡Aviso!", { body: "El tiempo en el reloj ha alcanzado los 60 minutos." });
                        }
                    });
                }
            }

            inputInicio.addEventListener("change", calcularTiempo);
            inputFin.addEventListener("change", calcularTiempo);
            inputInterrupcion.addEventListener("input", calcularTiempo);

            function calcularTiempo() {
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
        const actividades = [];

        filas.forEach((fila) => {
            const actividad = fila.cells[5].querySelector("input").value;
            const tiempo = parseFloat(fila.cells[4].querySelector("input").value);
            if (actividad && tiempo) {
                actividades.push({ actividad, tiempo });
            }
        });

        generarGrafico(actividades);
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
});
