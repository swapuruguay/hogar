const bindSubmitForm = (formId, endpoint) => {
  const form = document.getElementById(formId)
  if (!form) {
    return
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const formData = new FormData(form)
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData
    })
    await response.json()
    clearForm(form)
  })
}

const clearForm = (formElement) => {
  const { elements } = formElement
  for (let i = 0; i < elements.length; i += 1) {
    const fieldType = (elements[i].type || '').toLowerCase()
    switch (fieldType) {
      case 'text':
      case 'password':
      case 'textarea':
      case 'hidden':
        elements[i].value = ''
        break
      case 'radio':
      case 'checkbox':
        elements[i].checked = false
        break
      default:
        break
    }
  }
}

bindSubmitForm('form-ingresar-contribuyentes', '/contribuyentes/add')
bindSubmitForm('form-editar-contribuyentes', '/contribuyentes/editar')
