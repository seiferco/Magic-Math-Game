let enterNum = true; 

const gameStats = {
    GOAL: 0,
    CURRENT_SUM: 0,
    END_SUM: 0,
    WINS: 0,
    LOSSES: 0,
};

const workAreaTracker = {
    numChars: 0,
    valTurn: true,
    clickedBtns: [],
    buttonLvl: 1,
    btnPressed: 0,
};

window.addEventListener("DOMContentLoaded", domLoaded);

function domLoaded(){
    //when browser loaded, new game is created
    newGame(); 
    // Setup the click event for the "New game" button
	const newBtn = document.getElementById("newGameButton");
	newBtn.addEventListener("click", newGame);

    // Create click-event handlers for each game board button
	const gameBoardBtns = getGameBoardButtons();
	for (let button of gameBoardBtns) {
		button.addEventListener("click", function () { boardButtonClicked(button); });
    }

    // Creatle click-event handles for each operator button (+, -, *)
    const operatorBtns = getOperatorButtons();
    for(let opButton of operatorBtns){
        opButton.addEventListener("click", function () { operatorButtonClicked(opButton); });
	}

}  

// Returns an array of 4 <button> elements that make up the game board. The first 2
// elements are the top row, the next 2 are the bottom 2. 
function getGameBoardButtons() {
	return document.querySelectorAll("#gameBoard > button");
}

// Returns an array of 3 buttons being the operator buttons (+, -, *)
function getOperatorButtons() {
    return document.querySelectorAll("#operators > button");
}

// reset all the buttons in the gameBoard, and work area text
function newGame(){
	let buttons = resetButtons();
    getRandomGoal(buttons);

    // set all data and text to the default values
    setToDefault();
}

//Reset all the game board buttons
//Set them all to new random numbers, and enable all of them for new usage
function resetButtons(){
    const buttons = getGameBoardButtons();
	for (let button of buttons) {
		button.innerHTML = Math.floor(Math.random() * 10);
		button.removeAttribute("disabled"); // enable all buttons
	}
    return buttons;
}

//When new game button is clicked, set all text on website to default as well as object member variables
function setToDefault(){
    const workAreaPs = document.getElementById("workAreaPs");
    workAreaPs.innerHTML = "";
    workAreaTracker.numChars = 0;
    workAreaTracker.valTurn = true;
    workAreaTracker.buttonLvl = 1;
    gameStats.END_SUM = 0;
    workAreaTracker.btnPressed = 0;
    const displayMsg = document.getElementById("displayMsg");
    displayMsg.innerHTML = "Let's Play! -[Pick a number]";
}

//Creare a random goal by using the random function to randomly pick operators
function getRandomGoal(buttonsArray) {
    // Get the values of the game board buttons
    const values = Array.from(buttonsArray).map(button => parseInt(button.innerHTML));

    // Choose three random operators
    const operators = ['+', '-', '*'];
    const randomOperators = [];
    for (let i = 0; i < 3; i++) {
        randomOperators.push(operators[Math.floor(Math.random() * operators.length)]);
    }

    // Generate a random goal based on the values of the buttons and the chosen operators
    let goal = values[0];
    for (let i = 1; i < values.length; i++) {
        const operator = randomOperators[i - 1];
        switch (operator) {
            case '+':
                goal += values[i];
                break;
            case '-':
                goal -= values[i];
                break;
            case '*':
                goal *= values[i];
                break;
        }
    }

    // store the final goal in the object member variable for later comparison
    gameStats.GOAL = goal;

    //display goal on website
    document.getElementById("goalNum").textContent = goal; 
}

// function for when a game board button is clicked
function boardButtonClicked(button) {
    
    // check to see if it's time to enter a game board button or not
    if(workAreaTracker.valTurn === false){
        return;
    }
    
    // get buttons value and push it to an array that stores all the button's clicked values
    // This is later used to calculate the sum of each line
    const buttonVal = button.innerHTML;
    workAreaTracker.clickedBtns.push(buttonVal);

    const workAreaPs = document.getElementById("workAreaPs");
    
    // Check if work area's last child paragraph already holds an equation already 
    //If there are no paragraphs or an equation is already created, create a new paragraph to hold the next equation
    // else concatinate the button value to the last child paragraph
    if(workAreaTracker.numChars === 0 || workAreaTracker.numChars >= 3){
        const newParagraph = document.createElement("p");
        newParagraph.innerHTML = buttonVal; 
        workAreaPs.appendChild(newParagraph);
        workAreaTracker.numChars = 1;
    } else { 
        const currP = workAreaPs.lastElementChild;
        currP.innerHTML += " " + buttonVal;
        workAreaTracker.numChars++;
    }
    
    if(workAreaTracker.buttonLvl === 1){
        button.disabled = true;
        button.innerHTML = " ";
        const displayMsg = document.getElementById("displayMsg");
        displayMsg.innerHTML = "Pick an operator";
    }

    // set it so the next button must be an operator
    workAreaTracker.valTurn = false;

    // if th sum was calculated, allow another game board button to be entered 
    // Done by setting buttonLvl
    let merge = checkForSum();
    if (merge === 1){
        button.innerHTML = gameStats.CURRENT_SUM;
        workAreaTracker.buttonLvl = 1;
    }

    workAreaTracker.btnPressed++
    checkWinCondition(); //check if all buttons have been clicked

};

// function for when an operator button is clicked
function operatorButtonClicked(button) {
    
    // check if it's time to enter an operator button
    if(workAreaTracker.valTurn === true){
        return;
    }
    // Concatinate the operator button that was clicked to the work area's last child paragraph
    // No need to check if needing to create a new paragraph since an operator will always go between 2 game board btns
    const buttonVal = button.innerHTML;
    workAreaTracker.clickedBtns.push(buttonVal);

    const workAreaPs = document.getElementById("workAreaPs");
    const currP = workAreaPs.lastElementChild;
    currP.innerHTML += " " + buttonVal;

    workAreaTracker.numChars++
    workAreaTracker.valTurn = true; // expect a number next so user cannot enter another operator
    workAreaTracker.buttonLvl = 2;

    const displayMsg = document.getElementById("displayMsg");
    displayMsg.innerHTML = "Pick a number";
    
}
//if the user has entered an equation in of length 3 (Ex: num, op, num)
// evaluate the array that is holding the equation and put it inthe var sum. 
function checkForSum(){
    if(workAreaTracker.clickedBtns.length === 3){
        //evaluating sum of array function
        const sum = eval(workAreaTracker.clickedBtns.join('')); 
        gameStats.CURRENT_SUM = sum;
        
        // cancatinate sum the last Child of work area's paragraph
        const workAreaPs = document.getElementById("workAreaPs");
        const currP = workAreaPs.lastElementChild;
        currP.innerHTML += " = " + sum; 
        
        workAreaTracker.valTurn = true; //disable operator buttons so user has to enter a number now
        workAreaTracker.clickedBtns.length = 0; // clear array

        //if on the last number button to press, sum will hold the final sum
        //add it to END_SUM to later check for win conditions
        if(workAreaTracker.btnPressed === 5){
            gameStats.END_SUM = sum;
        }

        return 1;
    }
    return 0;
}

function checkWinCondition(){
    // If all possible buttons have been clicked, check win conditions
    if(workAreaTracker.btnPressed != 6){
        return;
    }

    //Get all elements needed from html to change accordingly
    const displayMsg = document.getElementById("displayMsg");
    const numWins = document.getElementById("numWins");
    const numLosses = document.getElementById("numLosses");

    //If user sum === randomly generated goal change innerHTML to "You Win!!" and increment numWins html
    //Otherwise, you lose and increment numLosses html
    if(gameStats.END_SUM === gameStats.GOAL){
        displayMsg.innerHTML = "You Win!!!"
        numWins.innerHTML++;
    } else {
        displayMsg.innerHTML = "Better luck next time...";
        numLosses.innerHTML++;
    }

    
}