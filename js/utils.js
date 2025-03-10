function questionConstruction(question, answer) {
    const questionObject = {
        question,
        answer,
        answerTemplate: answer.split(' ').map(word => word.length),
    }
    return questionObject;
}

console.log(questionConstruction("A movie with pirates", "Pirates of the Caribbean"));