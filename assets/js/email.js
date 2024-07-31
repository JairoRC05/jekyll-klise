const $form = document.querySelector("#form");
$form.addEventListener("submit", handleSumbit);
const ahora = document.querySelector('#btn').classList;

async function handleSumbit(event) {
  event.preventDefault();
  ahora.add('disabled')
  let regis = document.querySelector('#reg').innerHTML = 'REGISTRANDO...'
  const form = new FormData(this);
  const response = await fetch(this.action, {
    method: this.method,
    body: form,
    headers: {
      Accept: "application/json",
    },
  });
  if (response.ok) {
    this.reset();
    ahora.remove('disabled')
    let regs = document.querySelector('#reg').innerHTML = 'REGISTRO DEL DÚO'
    Swal.fire({
      position: "center",
      icon: "success",
      title: "¡REGISTRO EXITOSO!",
      showConfirmButton: false,
      timer: 1500
    });
  }
}