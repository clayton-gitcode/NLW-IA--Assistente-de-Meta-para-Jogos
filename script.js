const apiKeyInput = document.querySelector('#apiKey')
const gameSelect = document.getElementById('gameSelect')
const questionInput = document.getElementById('questionInput')
const askButton = document.getElementById('askButton')
const form = document.getElementById('form')

const aiResponse = document.getElementById('aiResponse')

const markdownToHTML = (text)=>{

    // const converter = new showdown.Converter()
    // return converter.makeHtml(text)

    const converter = new showdown.Converter({
        tables: true, // Enable table support
        simplifiedAutoLink: true, // Automatically link URLs
        strikethrough: true // Enable strikethrough syntax
    });
    return converter.makeHtml(text)
}

const perguntarAI = async(question, game, apiKey)=>{
    const key = 'COLOQUE SUA KEY AQUI'
    const model = "gemini-2.0-flash"
    const baseURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

    const pergunta = `
        ## Especialidade
        Você é um especialista assistente de um meta para o jogo ${game}

        ## tarefa
        Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégia, build e dicas.

        ## Regras
        - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar uma resposta.
        - Se a pergunta não está relacioanda ao jogo, responda com 'Essa pergunta não está relacionada ao jogo'.
        - Considere a data atual ${new Date().toLocaleDateString()}
        - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para uma resposta coerente.
        - Nunca responda itens que você não tenha certeza de que existe no patch atual.

        ## Respostas
        - Economize na resposta, seja direto e responda no maximo 500 caracteres.
        - Responda em markdown.
        - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.
        - Traduza tudo para o português do Brasil.

        ## Exemplo de resposta
        - Pergunta do usuário: Melhor build para rengar jungle.
        - Resposta: A build mais atual é: \n\n**Itens**\n\ncoloque os itens aqui.\n\n**Runas:**\n\nexemplo de runas\n\n

        ---
        Aqui está a pergunta do usuário ${question}
    `

    const tools = [{
        google_search:{}
    }]
    const contents = [{
        role: "user",
        parts: [{
            text: pergunta
        }]
    }]

    //chamada API
    const response = await fetch(baseURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            tools
        })
    })

    const data = await response.json()
    console.log({data})
    return data.candidates[0].content.parts[0].text
}

form.addEventListener('submit', async (event)=>{
    event.preventDefault()
    const apiKey = apiKeyInput.value
    const game = gameSelect.value
    const question = questionInput.value

    if(apiKey == '' || game == '' || question == ''){
        alert('Preencher todos os campos')
        return
    }

    askButton.disabled = true
    askButton.textContent = 'Gerando informção...'
    askButton.classList.add('loading')

    try {
        const text = await perguntarAI(question, game, apiKey)
        aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text)
        aiResponse.classList.remove('hidden')
    } catch (error) {
        console.log('Erro: ', error)
    }finally{
        askButton.disabled = false
        askButton.textContent = 'Perguntar'
        askButton.classList.remove('loading')
    }

})