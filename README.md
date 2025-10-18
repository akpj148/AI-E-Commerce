# AI-E-Commerce

E-Commerce with AI integration
-----------
description:
This is an E-Commerce web that focuses on selling technology where AI helps users in finding and giving recommendations regarding their needs. The source code is fully made by AI using GPT-5, with some fixing and changes for a better website. This prototype gives an idea of implementing AI in daily human life as a helper rather than replacing humans. This E-commerce web contains login, product display, cart, checkout, and processing.
-----------
technology use:
Language:
Using JavaScript with JSX syntax for writing React components.
Plain CSS for styling.

Framework/Library:
Using React framework as the core for building the frontend interface.

AI/Chat Integration:
Calls API to give input and receive output as message text.
AI uses Groq as default (I provide the API (yes, this should be kept secret, but I give it anyway)) and can be changed to whatever you like to use (but you need to change some code).
-----------
Features:
Talk to AI as an assistant in finding products that users want.
User and seller have different accounts, sellers can add products.
AI can provide explanations about the product that the user is about to buy and give comparisons between products.
List the product that is discount so user easier to get cheaper products
-----------
setup instruction:
Download all the files, then use Command Prompt and open the backend folder by typing:
cd C:\Users\name\Downloads\EcommerceAI\backend → (make sure it's the correct path)

Then type and run:
npm run dev

Do this again with a new terminal but for the frontend folder (after backend). The link to the HTML as localhost will be provided, and you can open it.
-----------
AI support explanation:
At the bottom, you can click on AI, and it will bring you to the chat box on the right side of the screen. When closed, the chat will remain unless reloaded. You can ask anything and have no limitation within the website.
AI has no access to products due to bad product placement and needs to be told what products are available to proceed with giving recommendations.
