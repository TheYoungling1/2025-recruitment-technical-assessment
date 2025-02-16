
const request = require("supertest");

describe("Task 1", () => {
  describe("POST /parse", () => {
    const getTask1 = async (inputStr) => {
      return await request("http://localhost:8080")
        .post("/parse")
        .send({ input: inputStr });
    };

    it("example1", async () => {
      const response = await getTask1("Riz@z RISO00tto!");
      expect(response.body).toStrictEqual({ msg: "Rizz Risotto" });
    });

    it("example2", async () => {
      const response = await getTask1("alpHa-alFRedo");
      expect(response.body).toStrictEqual({ msg: "Alpha Alfredo" });
    });

    it("error case", async () => {
      const response = await getTask1("");
      expect(response.status).toBe(400);
    });

    it("should handle names with only spaces", async () => {
      const response = await getTask1("      ");
      expect(response.status).toBe(400);
    });

    it("should remove excessive spaces and properly format", async () => {
      const response = await getTask1("  cHeeSe   bUrGEr    ");
      expect(response.body).toStrictEqual({ msg: "Cheese Burger" });
    });

    it("should captitalise the only remaining letter", async() => {
      const response = await getTask1("@e)))))");
      expect(response.body).toStrictEqual({ msg: "E"});
    });

  });
});

describe("Task 2 - Boundary Cases", () => {
  describe("POST /entry", () => {
    const putTask2 = async (data) => {
      return await request("http://localhost:8080").post("/entry").send(data);
    };

    it("Boundary: Just below valid cookTime (-1)", async () => {
      const resp = await putTask2({
        type: "ingredient",
        name: "Invalid Meat",
        cookTime: -1,
      });
      expect(resp.status).toBe(400);
    });

    it("Boundary: Recipe with exactly 1 requiredItem", async () => {
      const resp = await putTask2({
        type: "recipe",
        name: "Basic Toast",
        requiredItems: [{ name: "Bread", quantity: 1 }],
      });
      expect(resp.status).toBe(200);
    });

    it("Boundary: Adding a recipe with a requiredItem that has duplicate names (should fail)", async () => {
      const resp = await putTask2({
        type: "recipe",
        name: "Double Cheese",
        requiredItems: [
          { name: "Cheese", quantity: 1 },
          { name: "Cheese", quantity: 2 },
        ],
      });
      expect(resp.status).toBe(400);
    });

    it("Boundary: Adding an entry with an empty string as name (should fail)", async () => {
      const resp = await putTask2({
        type: "ingredient",
        name: "",
        cookTime: 5,
      });
      expect(resp.status).toBe(400);
    });

    it("Boundary: Adding a duplicate entry with different cookTime (should fail)", async () => {
      await putTask2({
        type: "ingredient",
        name: "Salt",
        cookTime: 1,
      });

      const resp = await putTask2({
        type: "ingredient",
        name: "Salt",
        cookTime: 5,
      });
      expect(resp.status).toBe(400);
    });

    it("Boundary: Adding a duplicate entry but as a different type (should fail)", async () => {
      await putTask2({
        type: "ingredient",
        name: "Olive Oil",
        cookTime: 1,
      });

      const resp = await putTask2({
        type: "recipe",
        name: "Olive Oil",
        requiredItems: [{ name: "Olives", quantity: 5 }],
      });
      expect(resp.status).toBe(400);
    });

    it("Boundary: Case-insensitive duplicate check (should fail)", async () => {
      await putTask2({
        type: "ingredient",
        name: "Sugar",
        cookTime: 2,
      });

      const resp = await putTask2({
        type: "ingredient",
        name: "sugar",
        cookTime: 4,
      });
      expect(resp.status).toBe(400);
    });

    it("Boundary: Adding a valid recipe with multiple required items", async () => {
      const resp = await putTask2({
        type: "recipe",
        name: "Pancake",
        requiredItems: [
         { name: "Flour", quantity: 2 },
          { name: "Egg", quantity: 1 },
          { name: "Milk", quantity: 1 },
        ],
      });
      expect(resp.status).toBe(200);
    });

    it("The name of the recipe should be cleaned up using function from part1", async() => {
      const resp = await putTask2({
        type: "recipe",
        name: "@@@@Pancake@@@flour$$$",
        requiredItems: [
         { name: "Flour", quantity: 2 },
          { name: "Egg", quantity: 1 },
          { name: "Milk", quantity: 1 },
        ],
      });
      expect(resp.status).toBe(200);

    });
  });
});


describe("Task 3", () => {
  describe("GET /summary", () => {
    const postEntry = async (data) => {
      return await request("http://localhost:8080").post("/entry").send(data);
    };

    const getTask3 = async (name) => {
      return await request("http://localhost:8080").get(
        `/summary?name=${name}`
      );
    };

    it("What is bro doing - Get empty cookbook", async () => {
      const resp = await getTask3("nothing");
      expect(resp.status).toBe(400);
    });

    it("What is bro doing - Get ingredient", async () => {
      const resp = await postEntry({
        type: "ingredient",
        name: "beef",
        cookTime: 2,
      });
      expect(resp.status).toBe(200);

      const resp2 = await getTask3("beef");
      expect(resp2.status).toBe(400);
    });

    it("Unknown missing item", async () => {
      const cheese = {
        type: "recipe",
        name: "Cheese",
        requiredItems: [{ name: "Not Real", quantity: 1 }],
      };
      const resp1 = await postEntry(cheese);
      expect(resp1.status).toBe(200);

      const resp2 = await getTask3("Cheese");
      expect(resp2.status).toBe(400);
    });

    it("Bro cooked", async () => {
      const meatball = {
        type: "recipe",
        name: "Skibidi",
        requiredItems: [{ name: "Bruh", quantity: 1 }],
      };
      const resp1 = await postEntry(meatball);
      expect(resp1.status).toBe(200);

      const resp2 = await postEntry({
        type: "ingredient",
        name: "Bruh",
        cookTime: 2,
      });
      expect(resp2.status).toBe(200);

      const resp3 = await getTask3("Skibidi");
      expect(resp3.status).toBe(200);
    });
  });
});
