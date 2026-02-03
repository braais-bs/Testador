let preguntas = [];
let contadorRespuestas = 0;


function anadirRespuesta() {
  const contenedor = document.getElementById("contenedor-respuestas");


  const div = document.createElement("div");
  div.className = "respuesta";


  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = `Respuesta ${contadorRespuestas + 1}`;
  input.className = "entrada-respuesta";
  
  const radio = document.createElement("input");
  radio.type = "radio";
  radio.name = "correcta";
  radio.value = contadorRespuestas;
  
  const botonEliminar = document.createElement("button");
  botonEliminar.textContent = "❌";
  botonEliminar.className = "boton-eliminar";
  botonEliminar.onclick = function() {
    contenedor.removeChild(div);
    contadorRespuestas--;
  };
  
  div.appendChild(input);
  div.appendChild(document.createTextNode(" Verdadera"));
  div.appendChild(radio);
  div.appendChild(botonEliminar);
  contenedor.appendChild(div);
  
  contadorRespuestas++;
}


function guardarPregunta() {
  const textoPregunta = document.getElementById("pregunta").value;
  const entradasRespuestas = document.querySelectorAll('.entrada-respuesta');
  const radios = document.querySelectorAll('input[name="correcta"]');
  
  if (!textoPregunta.trim()) {
    alert("Por favor, escribe una pregunta.");
    return;
  }
  
  if (entradasRespuestas.length < 2) {
    alert("Debes añadir al menos 2 respuestas.");
    return;
  }
  
  const respuestas = [];
  for (const input of entradasRespuestas) {
    if (!input.value.trim()) {
      alert("No puedes dejar respuestas vacías.");
      return;
    }
    respuestas.push(input.value.trim());
  }
  
  const indiceCorrecta = Array.from(radios).findIndex(r => r.checked);
  if (indiceCorrecta === -1) {
    alert("Selecciona cuál es la respuesta verdadera.");
    return;
  }
  
  const objetoPregunta = {
    question: textoPregunta,
    answers: respuestas,
    correct: indiceCorrecta
  };
  
  preguntas.push(objetoPregunta);
  mostrarPregunta(objetoPregunta);
  reiniciarFormulario();
}


function mostrarPregunta(objetoPregunta) {
  const lista = document.getElementById("lista-preguntas");
  const elemento = document.createElement("div");
  elemento.className = "pregunta";
  
  const respuestaCorrecta = objetoPregunta.answers[objetoPregunta.correct];
  
  elemento.innerHTML = `
    <div class="cabecera-pregunta">
      <strong>${objetoPregunta.question}</strong>
      <button class="boton-eliminar" onclick="eliminarPregunta(${preguntas.length - 1})">❌</button>
    </div>
    <div class="lista-respuestas">
      ${objetoPregunta.answers.map((a, i) =>
        i === objetoPregunta.correct ? 
        `<div class="respuesta correcta">✅ ${a}</div>` : 
        `<div class="respuesta">❌ ${a}</div>`
      ).join("")}
    </div>
  `;
  
  lista.appendChild(elemento);
}


function eliminarPregunta(indice) {
  preguntas.splice(indice, 1);
  actualizarListaPreguntas();
}


function actualizarListaPreguntas() {
  const lista = document.getElementById("lista-preguntas");
  lista.innerHTML = "";
  preguntas.forEach(mostrarPregunta);
}


function reiniciarFormulario() {
  document.getElementById("pregunta").value = "";
  document.getElementById("contenedor-respuestas").innerHTML = "";
  contadorRespuestas = 0;
}


// Función de validación añadida
function esTestValido(test) {
  if (!test || typeof test !== 'object') return false;
  if (!test.title || typeof test.title !== 'string') return false;
  if (!test.questions || !Array.isArray(test.questions)) return false;
  
  return test.questions.every(pregunta => {
    return pregunta.question && typeof pregunta.question === 'string' &&
           pregunta.answers && Array.isArray(pregunta.answers) &&
           typeof pregunta.correct === 'number' &&
           pregunta.correct >= 0 &&
           pregunta.correct < pregunta.answers.length;
  });
}


// Función generarTest() corregida
function generarTest() {
  const titulo = document.getElementById("titulo-test").value.trim();
  
  if (!titulo) {
    alert("Por favor, añade un título al test.");
    return;
  }
  
  if (preguntas.length === 0) {
    alert("Debes añadir al menos una pregunta.");
    return;
  }
  
  const test = {
    title: titulo,
    questions: preguntas.map(p => ({
      question: p.question,
      answers: p.answers,
      correct: p.correct
    }))
  };


  // Validación adicional
  if (!esTestValido(test)) {
    alert("El test generado no es válido. Por favor, revisa las preguntas.");
    return;
  }


  const json = JSON.stringify(test, null, 2);
  
  try {
    JSON.parse(json); // Verificación extra
    descargarJSON(json, titulo);
  } catch (error) {
    console.error("Error al generar JSON:", error);
    alert("Hubo un error al generar el test. Inténtalo de nuevo.");
  }
}


function descargarJSON(json, titulo) {
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${titulo.replace(/\s+/g, '_')}_test.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


// FUNCIONES HEADER
function irInicio() {
  window.location.href = "index.html"; // Cambia por tu url de inicio
}

