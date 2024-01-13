async function sendMessage() {
  const inputField = document.getElementById("userInput");
  const userText = inputField.value;
  inputField.value = "";

  // Display user's message
  document.getElementById(
    "chatbox"
  ).innerHTML += `<div>User: ${userText}</div>`;

  try {
    const response = await fetch("/get-response", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: userText }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Display AI's response and change door back to normal
    document.getElementById(
      "chatbox"
    ).innerHTML += `<div>AI: ${data.answer}</div>`;
  } catch (error) {
    console.error("Fetch error:", error.message);
    document.getElementById(
      "chatbox"
    ).innerHTML += `<div>Error: ${error.message}</div>`;
  }
}
