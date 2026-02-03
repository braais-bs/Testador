document.addEventListener('DOMContentLoaded', function() {
  // Elementos del DOM
  const entradaArchivo = document.getElementById('archivo-test');
  const botonIniciar = document.getElementById('iniciar-test');
  const casillaMezclar = document.getElementById('mezclar-preguntas');


  // Elementos de las secciones
  const seccionCarga = document.getElementById('seccion-carga');
  const seccionTest = document.getElementById('seccion-test');
  const seccionResultados = document.getElementById('seccion-resultados');
  const seccionResumen = document.getElementById('seccion-resumen');


  // Elementos de la pregunta
  const visualizacionTituloTest = document.getElementById('visualizacion-titulo-test');
  const visualizacionPreguntaActual = document.getElementById('pregunta-actual');
  const visualizacionTotalPreguntas = document.getElementById('total-preguntas');
  const textoPregunta = document.getElementById('texto-pregunta');
  const listaRespuestas = document.getElementById('lista-respuestas');
  const barraPreguntas = document.getElementById('barra-preguntas');
  const botonAnterior = document.getElementById('boton-anterior');
  const botonSiguiente = document.getElementById('boton-siguiente');
  const botonFinalizar = document.getElementById('boton-finalizar');


  // Elementos de resultados
  const visualizacionRespuestasCorrectas = document.getElementById('respuestas-correctas');
  const visualizacionRespuestasIncorrectas = document.getElementById('respuestas-incorrectas');
  const visualizacionRespuestasSinResponder = document.getElementById('respuestas-sin-responder');
  const visualizacionNotaFinal = document.getElementById('nota-final');


  // Elementos del mensaje de advertencia
  const mensajeAdvertencia = document.getElementById('mensaje-advertencia');
  const textoAdvertencia = document.getElementById('texto-advertencia');
  const spanConteoSinResponder = document.getElementById('conteo-sin-responder');
  const botonConfirmarFinalizar = document.getElementById('confirmar-finalizar');
  const botonCancelarFinalizar = document.getElementById('cancelar-finalizar');


  // Variables de estado
  let datosTest = null;
  let indicePreguntaActual = 0;
  let preguntasMezcladas = [];
  let modoPuntuacion = 'porcentaje';
  let factorPenalizacion = 2;
  let respuestasUsuario = [];
  let preguntasOriginales = [];
  let elementosBarraPreguntas = [];


  function mostrarSeccion(seccion) {
    seccionCarga.classList.remove('visible');
    seccionCarga.classList.add('oculto');
    seccionTest.classList.remove('visible');
    seccionTest.classList.add('oculto');
    seccionResultados.classList.remove('visible');
    seccionResultados.classList.add('oculto');
    seccionResumen.classList.remove('visible');
    seccionResumen.classList.add('oculto');
    seccion.classList.remove('oculto');
    seccion.classList.add('visible');
  }


  mostrarSeccion(seccionCarga);


  entradaArchivo.addEventListener('change', function(e) {
    const archivo = e.target.files[0];
    if (!archivo) {
      botonIniciar.disabled = true;
      return;
    }
    if (!archivo.name.endsWith('.json')) {
      alert("Por favor, selecciona un archivo JSON válido.");
      botonIniciar.disabled = true;
      return;
    }
    const lector = new FileReader();
    lector.onload = function(e) {
      try {
        datosTest = JSON.parse(e.target.result);
        preguntasOriginales = [...datosTest.questions];
        if (!datosTest || !datosTest.title || !datosTest.questions || !Array.isArray(datosTest.questions)) {
          throw new Error("Formato de test inválido");
        }
        datosTest.questions.forEach((q, i) => {
          if (!q.question || !q.answers || !Array.isArray(q.answers) || typeof q.correct !== 'number') {
            throw new Error(`Pregunta ${i + 1} mal formada`);
          }
        });
        botonIniciar.disabled = false;
      } catch (error) {
        console.error("Error al leer el archivo:", error);
        alert(`Error al leer el archivo: ${error.message}`);
        botonIniciar.disabled = true;
      }
    };
    lector.onerror = function() {
      alert("Error al leer el archivo. Inténtalo de nuevo.");
      botonIniciar.disabled = true;
    };
    lector.readAsText(archivo);
  });


  function guardarRespuestaActual() {
    const botonSeleccionado = listaRespuestas.querySelector('.boton-respuesta.seleccionado');
    if (botonSeleccionado) {
      const botones = Array.from(listaRespuestas.querySelectorAll('.boton-respuesta'));
      const indiceSeleccionado = botones.indexOf(botonSeleccionado);
      if (indiceSeleccionado !== -1) {
        respuestasUsuario[indicePreguntaActual] = indiceSeleccionado;
      }
    }
  }


  botonIniciar.addEventListener('click', function() {
    if (!datosTest) {
      alert("No se ha cargado ningún test válido.");
      return;
    }
    modoPuntuacion = document.querySelector('input[name="modo-puntuacion"]:checked').value;
    if (modoPuntuacion === 'penalizacion') {
      const entradaFactor = parseInt(document.getElementById('factor-penalizacion').value);
      factorPenalizacion = entradaFactor >= 1 ? entradaFactor : 1;
    }
    preguntasMezcladas = [...datosTest.questions];
    if (casillaMezclar.checked) {
      preguntasMezcladas = mezclarArray(preguntasMezcladas);
    }
    visualizacionTituloTest.textContent = datosTest.title;
    visualizacionTotalPreguntas.textContent = preguntasMezcladas.length;
    mostrarSeccion(seccionTest);
    indicePreguntaActual = 0;
    respuestasUsuario = new Array(preguntasMezcladas.length);
    elementosBarraPreguntas = [];
    crearBarraPreguntas();
    mostrarPregunta();
  });


  function crearBarraPreguntas() {
    barraPreguntas.innerHTML = '';
    preguntasMezcladas.forEach((_, indice) => {
      const botonPregunta = document.createElement('button');
      botonPregunta.className = 'boton-pregunta';
      botonPregunta.textContent = indice + 1;
      if (indice === indicePreguntaActual) {
        botonPregunta.classList.add('actual');
      }
      botonPregunta.addEventListener('click', () => {
        indicePreguntaActual = indice;
        mostrarPregunta();
      });
      barraPreguntas.appendChild(botonPregunta);
      elementosBarraPreguntas.push(botonPregunta);
    });
  }


  function actualizarBarraPreguntas() {
    elementosBarraPreguntas.forEach((btn, indice) => {
      btn.classList.toggle('respondida', respuestasUsuario[indice] !== undefined);
      btn.classList.toggle('actual', indice === indicePreguntaActual);
    });
  }


  function mostrarPregunta() {
    if (indicePreguntaActual >= preguntasMezcladas.length) return;
    const pregunta = preguntasMezcladas[indicePreguntaActual];
    visualizacionPreguntaActual.textContent = indicePreguntaActual + 1;
    textoPregunta.textContent = pregunta.question;
    listaRespuestas.innerHTML = '';
    pregunta.answers.forEach((respuesta, indice) => {
      const botonRespuesta = document.createElement('button');
      botonRespuesta.className = 'boton-respuesta';
      botonRespuesta.textContent = respuesta;


      // Cambio aquí para permitir deseleccionar la respuesta si se pulsa otra vez
      botonRespuesta.addEventListener('click', function() {
        const todosBotones = document.querySelectorAll('.boton-respuesta');
        const yaSeleccionado = this.classList.contains('seleccionado');


        if (yaSeleccionado) {
          this.classList.remove('seleccionado');
          respuestasUsuario[indicePreguntaActual] = undefined;
        } else {
          todosBotones.forEach(btn => btn.classList.remove('seleccionado'));
          this.classList.add('seleccionado');
          respuestasUsuario[indicePreguntaActual] = indice;
        }
        actualizarBarraPreguntas();
      });


      if (respuestasUsuario[indicePreguntaActual] === indice) {
        botonRespuesta.classList.add('seleccionado');
      }


      listaRespuestas.appendChild(botonRespuesta);
    });
    actualizarBotonesNavegacion();
    actualizarBarraPreguntas();
  }


  function actualizarBotonesNavegacion() {
    botonAnterior.disabled = indicePreguntaActual === 0;
    botonSiguiente.disabled = indicePreguntaActual === preguntasMezcladas.length - 1;
  }


  botonAnterior.addEventListener('click', function() {
    if (indicePreguntaActual > 0) {
      indicePreguntaActual--;
      mostrarPregunta();
    }
  });


  botonSiguiente.addEventListener('click', function() {
    if (indicePreguntaActual < preguntasMezcladas.length - 1) {
      indicePreguntaActual++;
      mostrarPregunta();
    }
  });


  botonFinalizar.addEventListener('click', function() {
    guardarRespuestaActual();
    const conteos = contarRespuestas();
    if (conteos.sinResponder > 0) {
      textoAdvertencia.textContent = 'No se respondieron todas las preguntas';
      mensajeAdvertencia.style.display = 'flex';
    } else {
      evaluarYMostrarResultados();
    }
  });


  botonConfirmarFinalizar.addEventListener('click', function() {
    mensajeAdvertencia.style.display = 'none';
    evaluarYMostrarResultados();
  });


  botonCancelarFinalizar.addEventListener('click', function() {
    mensajeAdvertencia.style.display = 'none';
  });


  function contarRespuestas() {
    let correctas = 0, incorrectas = 0, sinResponder = 0;
    preguntasMezcladas.forEach((q, i) => {
      const a = respuestasUsuario[i];
      if (a === undefined) sinResponder++;
      else if (a === q.correct) correctas++;
      else incorrectas++;
    });
    return { correctas, incorrectas, sinResponder };
  }


  function evaluarYMostrarResultados() {
    const resultados = evaluarTest();
    window.resultadosTest = resultados;
    mostrarResultados(resultados);
  }


  function evaluarTest() {
    const resultadosDetallados = [];
    let correctas = 0, incorrectas = 0, sinResponder = 0;
    preguntasMezcladas.forEach((pregunta, indice) => {
      const respuestaUsuario = respuestasUsuario[indice];
      const estaRespondida = respuestaUsuario !== undefined;
      const esCorrecta = estaRespondida && respuestaUsuario === pregunta.correct;
      if (!estaRespondida) sinResponder++;
      else if (esCorrecta) correctas++;
      else incorrectas++;
      resultadosDetallados.push({
        question: pregunta.question,
        answers: [...pregunta.answers],
        userAnswerIndex: respuestaUsuario,
        correctAnswerIndex: pregunta.correct,
        isCorrect: esCorrecta,
        isAnswered: estaRespondida
      });
    });
    return {
      title: datosTest.title,
      questions: preguntasMezcladas.length,
      correct: correctas,
      incorrect: incorrectas,
      unanswered: sinResponder,
      detailedResults: resultadosDetallados
    };
  }


  function calcularNota(correctas, incorrectas, sinResponder) {
    const total = correctas + incorrectas + sinResponder;
    const valorPorPregunta = 10 / total;
    const netasCorrectas = correctas - Math.floor(incorrectas / factorPenalizacion);
    return Math.max(0, netasCorrectas * valorPorPregunta);
  }


  function formatearNota(nota) {
    return nota % 1 === 0 ? nota.toString() : nota.toFixed(2);
  }


  function mostrarResultados(resultados) {
    mostrarSeccion(seccionResultados);
    const nota = calcularNota(resultados.correct, resultados.incorrect, resultados.unanswered);
    const notaFormateada = formatearNota(nota);
    visualizacionRespuestasCorrectas.textContent = resultados.correct;
    visualizacionRespuestasIncorrectas.textContent = resultados.incorrect;
    visualizacionRespuestasSinResponder.textContent = resultados.unanswered;
    visualizacionNotaFinal.textContent = notaFormateada;
    visualizacionNotaFinal.style.color = nota >= 7 ? '#2ecc71' : nota >= 5 ? '#f39c12' : '#e74c3c';
  }


  window.mostrarResumen = function() {
    const resultados = window.resultadosTest;
    const listaResumen = document.getElementById('lista-resumen');
    listaResumen.innerHTML = '';
    resultados.detailedResults.forEach((resultado, indice) => {
      const elementoResumen = document.createElement('div');
      let claseContorno = !resultado.isAnswered ? 'sin-responder' : resultado.isCorrect ? 'correcta' : 'incorrecta';
      elementoResumen.className = `elemento-resumen ${claseContorno}`;
      elementoResumen.innerHTML = `<h3>Pregunta ${indice + 1}: ${resultado.question}</h3>
        <div class="resumen-respuesta">
          ${resultado.answers.map((respuesta, i) => {
            let claseCaja = '';
            if (i === resultado.correctAnswerIndex) claseCaja = 'caja-correcta';
            else if (i === resultado.userAnswerIndex && !resultado.isCorrect) claseCaja = 'caja-incorrecta';
            return `<div class="contenedor-respuesta ${claseCaja}">${String.fromCharCode(65 + i)}. ${respuesta}</div>`;
          }).join('')}
        </div>`;
      listaResumen.appendChild(elementoResumen);
    });
    mostrarSeccion(seccionResumen);
  };


  window.mostrarSeccionResultados = function() {
    mostrarSeccion(seccionResultados);
  };


  window.reiniciarTest = function() {
    entradaArchivo.value = '';
    botonIniciar.disabled = true;
    datosTest = null;
    mostrarSeccion(seccionCarga);
  };


  function mezclarArray(array) {
    const nuevoArray = [...array];
    for (let i = nuevoArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nuevoArray[i], nuevoArray[j]] = [nuevoArray[j], nuevoArray[i]];
    }
    return nuevoArray;
  }


  const radioPenalizacion = document.getElementById('puntuacion-penalizacion');
  const controlPenalizacion = document.getElementById('control-penalizacion');


  if (radioPenalizacion && controlPenalizacion) {
    radioPenalizacion.addEventListener('change', function() {
      controlPenalizacion.style.display = this.checked ? 'flex' : 'none';
    });
    document.getElementById('puntuacion-porcentaje').addEventListener('change', function() {
      controlPenalizacion.style.display = 'none';
    });
  }
});
