// This file is released under the MIT license.
// See LICENSE.md.

clauses = [];
assignment = {};

var output = "";
var outputElement = document.getElementById('output');
updateOutput();

var inputElement = ace.edit("input");
inputElement.setTheme("ace/theme/textmate");
inputElement.$blockScrolling = Infinity;
inputElement.setOptions({
  useSoftTabs: true,
  tabSize: 2,
  maxLines: Infinity,
  autoScrollEditorIntoView: true
});

// The following three functions are taken (in modified form) from:
// https://github.com/psaikko/tinysat

function isWhitespace(c) {
  return (c == '\t') || (c == '\n') || (c == ' ');
}

function skipWhitespace(text, i) {
  while (i < text.length && isWhitespace(text[i])) ++i;
  return i;
}

// parse cnf format instance
function parse(text) {
  var clauses = [];
  var i = 0;
  var maxVar = 0;
  while (i < text.length) {
    i = skipWhitespace(text, i);
    if (i == text.length) break;

    if (text[i] == 'c') {
      while(text[i++] != '\n' && i < text.length) ;
    } else if (text[i] == 'p') {
      while(text[i++] != '\n' && i < text.length) ;
    } else {
      var clause = []
      var lit = 0;
      while (i < text.length) {
        var j = 0;
        while (!isWhitespace(text[i+j]) && i+j < text.length)
          ++j;
        lit = parseInt(text.substring(i, i+j))
        if (lit != 0) {
          maxVar = Math.max(maxVar, Math.abs(lit))
          clause.push(lit);
          i = skipWhitespace(text, i+j);
        } else {
          i += j;
          break;
        }
      }
      clauses.push(clause);
    }
  }
  return clauses;
}

function resetAssignment() {
  assignment = {};
  displayClauses();
  renderOutput();
}

function assignLiteral(lit) {
  var varnum = Math.abs(lit);
  var positive = true;
  if (lit < 0) {
    positive = false;
  }
  assignment[varnum] = {
    positive: positive,
  }
  console.log(assignment);
  displayClauses();
  renderOutput();
}

function getTruthValue(input) {
  if (Array.isArray(input)) {
    // Check truth value of clause
    var clause = input;
    var all_lits_false = true;
    for (let j = 0; j < clause.length; j++) {
      var lit = clause[j];
      var value = getTruthValue(lit);
      if (value != null && value) {
        return true;
      } else if (value == null) {
        all_lits_false = false;
      }
    }
    if (all_lits_false) {
      return false;
    }
    return null;
  } else {
    // Check truth value of literal
    var lit = input;
    var varnum = Math.abs(lit);
    var positive = true;
    if (lit < 0) {
      positive = false;
    }
    var value = assignment[varnum];
    if (value == null) {
      return null;
    }
    return (value.positive == positive);
  }
}

function loadInput() {
  clauses = parse(inputElement.getValue());
  resetAssignment();
}

function displayClauses() {
  html_string = "";
  for (let i = 0; i < clauses.length; i++) {
    clause = clauses[i];
    var class_string = "clause";
    if (getTruthValue(clause) != null && getTruthValue(clause)) {
      class_string += " trueclause";
    } else if (getTruthValue(clause) != null && !getTruthValue(clause)) {
      class_string += " falseclause";
    } else {
      class_string += " openclause";
    }
    html_string += "<ul class='" + class_string + "'>";
    for (let j = 0; j < clause.length; j++) {
      lit = clause[j];
      var class_string = "literal";
      if (getTruthValue(lit) != null && getTruthValue(lit)) {
        class_string += " truelit";
      } else if (getTruthValue(lit) != null && !getTruthValue(lit)) {
        class_string += " falselit";
      } else {
        class_string += " openlit";
      }
      html_string += "<li class='" + class_string + "' "
      html_string += "onclick='assignLiteral(" + lit + ")' ";
      html_string += ">";
      if (lit < 0) {
        html_string += "&not;" + -1*lit;
      } else {
        html_string += lit;
      }
      html_string += "</li>";
      if (j < clause.length-1) {
        html_string += "<li>&or;</li>";
      }
    }
    html_string += "</ul>";
  }
  document.getElementById("formula").innerHTML = html_string;
}

function clearOutput() {
  output = "";
}

function addToOutput(text) {
  output += text;
  updateOutput();
}

function updateOutput() {
  if (outputElement) {
    var output_to_show = " ";
    if (output != "") {
      output_to_show = output;
    }
    outputElement.textContent = output_to_show;
    // outputElement.scrollTop = outputElement.scrollHeight; // focus on bottom
  }
}

function renderOutput() {
  clearOutput();
  var num_literals_assigned = Object.keys(assignment).length;
  addToOutput("Number of literals assigned: " + num_literals_assigned + "\n");
  var num_clauses_true = 0;
  var num_clauses_false = 0;
  var num_clauses_open = 0;
  for (let i = 0; i < clauses.length; i++) {
    var value = getTruthValue(clauses[i]);
    if (value == null) {
      num_clauses_open++;
    } else if (value) {
      num_clauses_true++;
    } else {
      num_clauses_false++;
    }
  }
  addToOutput("\n");
  addToOutput("Number of clauses made true: " + num_clauses_true + "\n");
  addToOutput("Number of clauses made false: " + num_clauses_false + "\n");
  addToOutput("Number of clauses left open: " + num_clauses_open + "\n");
  addToOutput("\n");
  if (num_clauses_open != 0) {
    addToOutput("Formula satisfied? Not yet..\n");
  } else if (num_clauses_false == 0) {
    addToOutput("Formula satisfied? Yes!\n");
  } else {
    addToOutput("Formula satisfied? No!\n");
  }
  updateOutput();
}

loadInput();
