import express, { Request, Response } from "express";

// ==== Type Definitions, feel free to add or modify ==========================
interface cookbookEntry {
  name: string;
  type: string;
}

interface requiredItem {
  name: string;
  quantity: number;
}

interface recipe extends cookbookEntry {
  requiredItems: requiredItem[];
}

interface ingredient extends cookbookEntry {
  cookTime: number;
}

// =============================================================================
// ==== HTTP Endpoint Stubs ====================================================
// =============================================================================
const app = express();
app.use(express.json());

// Store your recipes here!
const cookbook: cookbookEntry[] = [];

// Task 1 helper (don't touch)
app.post("/parse", (req:Request, res:Response) => {
  const { input } = req.body;

  const parsed_string = parse_handwriting(input)
  if (parsed_string == null) {
    res.status(400).send("this string is cooked");
    return;
  } 
  res.json({ msg: parsed_string });
  return;
  
});

// [TASK 1] ====================================================================
// Takes in a recipeName and returns it in a form that 
const parse_handwriting = (recipeName) => {
  // TODO: implement me
  if (recipeName == null) {
    return null
  }

  // Have 2 pointers to keep track of the current and previous element in the string
  let stringProcessed = "";


  for (let i = 0; i < recipeName.length; i++) {
    // References the previous element in the string
    if (isValidCharacter(recipeName.charAt(i))) {
      // Appending the valid characters to the empty string
      stringProcessed += recipeName.charAt(i).toLowerCase(); 
    }
  }
  // Replaces hypens and underscores with spaces
  stringProcessed = stringProcessed.replace(/[-_]/g, " ");
  stringProcessed = stringProcessed.trim();
  stringProcessed = stringProcessed.replace(/\s+/g, " ");

  // Split each word in the string by space
  let splitWords = stringProcessed.split(" ");

  for (let i = 0; i < splitWords.length; i++) {
    // Capitalise each individual word and recombine they with the rest of the string
    splitWords[i] = splitWords[i].charAt(0).toUpperCase() + splitWords[i].slice(1);
  }

  // re-join all the words by 1 space
  stringProcessed = splitWords.join(" ");

  if (stringProcessed.length <= 0) {
    return null;
  }

  return stringProcessed;
}

// Helper function to determine if a character is valid in the recipe name
function isValidCharacter(char) {
  return /^[a-zA-Z ]$/.test(char) || char == '-' || char == '_';
}

// [TASK 2] ====================================================================
// Endpoint that adds a CookbookEntry to your magical cookbook
app.post("/entry", (req: Request, res: Response) => {
  const entry: cookbookEntry = req.body;
  
  if (!validEntry(entry)) {
    return res.status(400).send("Invalid entry");
  }

  entry.name = parse_handwriting(entry.name);
  cookbook.push(entry);
  res.status(200).json({});
});

const validEntry = (entry: cookbookEntry): Boolean => {
  // If the name field is empty
  if (parse_handwriting(entry.name) == null) {
    return false;
  }

  if (entry.type.toLowerCase() != "recipe" && entry.type.toLowerCase() != "ingredient") {
    return false;
  }

  // If entry is an ingredient, cookTime must be >= 0
  if (isIngredient(entry) && entry.cookTime < 0) {
    return false;
  }
  
  // If entry is a recipe, must have more than one required ingredient
  if (isRecipe(entry)) {
    // Create a new array filled with extracted name field values of entries
    const names = entry.requiredItems.map(item => item.name.toLowerCase());
    console.log(names)
    // A set includes all the unique values in the array
    const hasDuplicates = new Set(names).size === entry.requiredItems.length;
    // I.e. there are repeated elements in the cookbook array
    if (!hasDuplicates) {
      return false;
    }
  }
  

  const uniqueName = cookbook.find((existingentry) => existingentry.name.toLowerCase() === entry.name.toLowerCase());
  // If this name already exists in the array of entries
  if (uniqueName) {
    return false;
  }

  return true;
}

// Typeguard check function that ensures that this entry is an ingredient
function isIngredient(entry: cookbookEntry): entry is ingredient {
  return "cookTime" in entry;
}

// Typeguard check function that ensures that this entry is a recuipe
function isRecipe(entry: cookbookEntry): entry is recipe {
  return "requiredItems" in entry;
}


// [TASK 3] ====================================================================
// Endpoint that returns a summary of a recipe that corresponds to a query name
app.get("/summary", (req:Request, res:Request) => {
  // TODO: implement me
  res.status(500).send("not yet implemented!")

});

// =============================================================================
// ==== DO NOT TOUCH ===========================================================
// =============================================================================
const port = 8080;
app.listen(port, () => {
  console.log(`Running on: http://127.0.0.1:8080`);
});
