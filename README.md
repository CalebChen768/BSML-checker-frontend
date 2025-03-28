# BSML-checker-frontend

This project was created by **V0 AI**, then refined by **GPT** with **minimal human intervention**.  
Below is the original prompt process of using ***V0** that guided its development:

---

## Prompt Steps

1. **Initial Requirement**  
   Please help me build a beautiful front-end page using **HTML** and **JavaScript**.  
   The page should allow the user to input a **universe** (a set of `world::int`),  
   specify for each `world` the set of `P::int` that are true,  
   define the **relations** between `world -> world`,  
   and define a **state** (a subset of the universe).  
   Then, the user should be able to input a **formula** in a textbox,  
   which will be sent to the **backend** (mocked for now),  
   and the frontend will display whether the result is **true or false**.

2. **Model Visualization**  
   Great job so far. Now, please add a **"Visualize Model"** button that becomes available after the user inputs all information (except the formula).  
   When clicked, it should generate a **visual model** in the front end.

3. **Sorted Inputs**  
   I want all input sections for `world`, `P`, `truth values`, and `relations` to be displayed in **ascending order** based on their values.

4. **UI Adjustment for Relations**  
   The **"+" button** in the relation input is currently squished. Please adjust its appearance for better clarity.

5. **Validate Button Request**  
   For now, follow my steps.  
   I want the **"Validate"** button to send the request as described above.
