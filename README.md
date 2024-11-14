# My First Programming Project: miniGameStickman

## Overview

Welcome to my very first programming project! This project is a simple game developed using the p5.js library, showcasing my journey into coding and game development. 
The game involves creating shapes and interacting with them, which has been an exciting learning experience. 

This game was developed as the final project for one of the modules in my BA in Computer Science at a UK university, earning a grade of 90%, with anything above 70% considered an A.

## Project Description

In this game, users can interact with various shapes on the screen. The main features include:

- **Shape Creation:** The ability to draw shapes using the mouse.
- **Interaction:** Shapes respond to user interactions, providing a simple but engaging experience.

## Code Structure

The code is organized to implement basic functionality for the game. Below is a breakdown of the main components of the code:

- **Setup Function:** Initializes the canvas and prepares the game environment.
- **Draw Function:** Contains the main loop where shapes are drawn and updated.
- **Mouse Interaction:** Captures mouse events to create and interact with shapes.

## Code Improvement Suggestions

While the current implementation serves as a great starting point, there are several areas where the code can be improved, particularly regarding **Separation of Concerns (SoC)** and **Object-Oriented Programming (OOP)** principles.

### 1. Separation of Concerns (SoC)

- **Decoupling Logic and Presentation:** The code could benefit from separating the game logic from the rendering logic. For instance, a dedicated class or module could manage the game state (e.g., which shapes are present and their properties) while another handles drawing these shapes on the canvas.
- **Input Handling:** Extract input handling into a separate module to improve maintainability and scalability. This would allow for easier adjustments if the input method changes in the future.

### 2. Object-Oriented Programming (OOP) Principles

- **Shape Class:** Implement a `Shape` class that encapsulates properties and methods related to shapes. This class could include attributes like position, size, and color, and methods for drawing and updating the shape.
- **Inheritance:** Consider using inheritance for different shape types (e.g., `Circle`, `Square`) that extend the `Shape` class. This would allow for more specialized behavior and properties for each shape type.
- **Encapsulation:** Ensure that properties of the shapes are encapsulated within the `Shape` class, allowing controlled access through methods. This practice promotes better data integrity and reduces unintended interactions.

### 3. Additional Enhancements

- **Game Mechanics:** Introduce additional game mechanics, such as scoring or levels, to make the game more engaging.
- **User Interface:** Implement a basic user interface to guide users on how to play and interact with the game.
- **Testing:** Write tests for the game logic to ensure that all components work correctly and to facilitate future changes.

## Conclusion

This project marks the beginning of my journey in programming. I am excited to continue improving my skills and knowledge in game development. Any feedback or suggestions would be greatly appreciated!



