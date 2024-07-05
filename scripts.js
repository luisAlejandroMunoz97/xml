document.addEventListener("DOMContentLoaded", function() {
    if (document.getElementById('novelas-list')) {
        cargarNovelas();
    }
    if (document.getElementById('novela-form')) {
        const urlParams = new URLSearchParams(window.location.search);
        const novelaId = urlParams.get('id');
        if (novelaId) {
            cargarNovela(novelaId);
        }
        document.getElementById('capitulo-form').addEventListener('submit', function(event) {
            event.preventDefault();
            agregarCapitulo(novelaId);
        });
    }
    if (document.getElementById('contenido-lectura')) {
        const urlParams = new URLSearchParams(window.location.search);
        const novelaId = urlParams.get('id');
        const capituloIndex = parseInt(urlParams.get('capitulo'), 10);
        if (novelaId && !isNaN(capituloIndex)) {
            leerNovela(novelaId, capituloIndex);
            mostrarTitulosCapitulos(novelaId);
        }
    }
});

function cargarNovelas() {
    const novelas = obtenerNovelas();
    const lista = document.getElementById('novelas-list');
    lista.innerHTML = '';
    novelas.forEach(novela => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${novela.titulo}</span>
            <div>
                <button onclick="editarNovela(${novela.id})">Editar</button>
                <button onclick="eliminarNovela(${novela.id})">Eliminar</button>
                <button onclick="leerNovelaInicio(${novela.id})">Leer</button>
            </div>`;
        lista.appendChild(li);
    });
}

function cargarNovela(id) {
    const novelas = obtenerNovelas();
    const novela = novelas.find(novela => novela.id == id);
    if (novela) {
        document.getElementById('titulo').value = novela.titulo;
        document.getElementById('contenido').value = novela.contenido;
        document.getElementById('novela-title').innerText = novela.titulo;

        // Cargar capítulos
        const capitulosDiv = document.getElementById('capitulos');
        capitulosDiv.innerHTML = '';
        novela.capitulos.forEach((capitulo, index) => {
            const capituloDiv = document.createElement('div');
            capituloDiv.className = 'capitulo';
            capituloDiv.innerHTML = `
                <h2>${capitulo.titulo}</h2>
                <p>${capitulo.contenido}</p>
                <button onclick="editarCapitulo(${novela.id}, ${index})">Editar Capítulo</button>
                <button onclick="eliminarCapitulo(${novela.id}, ${index})">Eliminar Capítulo</button>`;
            capitulosDiv.appendChild(capituloDiv);
        });
    }
}

function guardarNovela() {
    const titulo = document.getElementById('titulo').value;
    const contenido = document.getElementById('contenido').value;
    const urlParams = new URLSearchParams(window.location.search);
    const novelaId = urlParams.get('id');
    let novelas = obtenerNovelas();

    if (novelaId) {
        const index = novelas.findIndex(novela => novela.id == parseInt(novelaId));
        if (index !== -1) {
            novelas[index].titulo = titulo;
            novelas[index].contenido = contenido;
        }
    } else {
        const nuevaNovela = {
            id: Date.now(),
            titulo,
            contenido,
            capitulos: []
        };
        novelas.push(nuevaNovela);
    }
    guardarNovelas(novelas);
    window.location.href = 'index.html';
}

function agregarCapitulo(novelaId) {
    const tituloCapitulo = document.getElementById('titulo-capitulo').value;
    const contenidoCapitulo = document.getElementById('contenido-capitulo').value;
    let novelas = obtenerNovelas();
    const novela = novelas.find(novela => novela.id == parseInt(novelaId));

    if (novela) {
        novela.capitulos.push({
            titulo: tituloCapitulo,
            contenido: contenidoCapitulo
        });
        guardarNovelas(novelas);
        cargarNovela(novelaId);  // Recargar la novela para mostrar el nuevo capítulo
    }
}

function editarCapitulo(novelaId, capituloIndex) {
    const novelas = obtenerNovelas();
    const novela = novelas.find(novela => novela.id == novelaId);

    if (novela && novela.capitulos[capituloIndex]) {
        const capitulo = novela.capitulos[capituloIndex];
        // Guardar la información del capítulo en localStorage para la edición
        localStorage.setItem('capituloEditando', JSON.stringify({
            novelaId: novelaId,
            capituloIndex: capituloIndex,
            titulo: capitulo.titulo,
            contenido: capitulo.contenido
        }));
        // Redirigir a la página de edición de capítulo
        window.location.href = 'editar_capitulo.html';
    }
}


function eliminarCapitulo(novelaId, capituloIndex) {
    const confirmacion = confirm('¿Seguro que quieres eliminar este capítulo?');
    if (confirmacion) {
        const novelas = obtenerNovelas();
        const novela = novelas.find(novela => novela.id == novelaId);

        if (novela && novela.capitulos[capituloIndex]) {
            novela.capitulos.splice(capituloIndex, 1); // Elimina el capítulo del arreglo
            guardarNovelas(novelas); // Guarda los cambios en el almacenamiento local
            cargarNovela(novelaId); // Recarga la novela para actualizar la interfaz
        }
    }
}

function editarNovela(id) {
    window.location.href = `novela.html?id=${id}`;
}

function eliminarNovela(id) {
    let novelas = obtenerNovelas();
    novelas = novelas.filter(novela => novela.id != id);
    guardarNovelas(novelas);
    cargarNovelas();
}

function leerNovelaInicio(id) {
    window.location.href = `leer_novela.html?id=${id}&capitulo=0`;
}

function leerNovela(id, capituloIndex) {
    const novelas = obtenerNovelas();
    const novela = novelas.find(novela => novela.id == parseInt(id));
    if (novela) {
        document.getElementById('novela-title').innerText = novela.titulo;
        const capitulo = novela.capitulos[capituloIndex];
        if (capitulo) {
            document.getElementById('titulo-capitulo').innerText = capitulo.titulo;
            document.getElementById('contenido-capitulo').innerText = capitulo.contenido;

            document.getElementById('anterior-capitulo').disabled = capituloIndex <= 0;
            document.getElementById('siguiente-capitulo').disabled = capituloIndex >= novela.capitulos.length - 1;

            document.getElementById('anterior-capitulo').onclick = function() {
                if (capituloIndex > 0) {
                    window.location.href = `leer_novela.html?id=${id}&capitulo=${capituloIndex - 1}`;
                }
            };

            document.getElementById('siguiente-capitulo').onclick = function() {
                if (capituloIndex < novela.capitulos.length - 1) {
                    window.location.href = `leer_novela.html?id=${id}&capitulo=${capituloIndex + 1}`;
                }
            };
        }
    }
}

function mostrarTitulosCapitulos(novelaId) {
    const novelas = obtenerNovelas();
    const novela = novelas.find(novela => novela.id == parseInt(novelaId));
    const listaCapitulos = document.getElementById('lista-capitulos');
    
    if (novela && listaCapitulos) {
        listaCapitulos.innerHTML = '';
        novela.capitulos.forEach((capitulo, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="leer_novela.html?id=${novelaId}&capitulo=${index}">${capitulo.titulo}</a>`;
            listaCapitulos.appendChild(li);
        });
    }
}

function obtenerNovelas() {
    return JSON.parse(localStorage.getItem('novelas')) || [];
}

function guardarNovelas(novelas) {
    localStorage.setItem('novelas', JSON.stringify(novelas));
}


