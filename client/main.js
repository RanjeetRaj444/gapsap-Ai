// import userSVG from "./assets/user.svg";
import aiSVG from "./assets/bot.svg";

let hasChatStarted = false;

const form = document.querySelector("form");
const chatContainer = document.querySelector(".chat-bot_body");
const refreshButton = document.querySelector(".reset-chats");

let loadInterval;

function loader(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === "....") {
      element.textContent = "";
    }
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, 300);
}

function typeText(element, text) {
  let index = 0;
  let interval = setInterval(() => {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      chatContainer.scrollTop = chatContainer.scrollHeight;
      index++;
    } else {
		clearInterval(interval);
    }
  }, 20);
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);
  return `${timestamp}-${hexadecimalString}`;
}

function chartStripe(isAi, value, uniqueId) {
  const copyId = uniqueId + generateUniqueId();
  return `
        <div class="chat-bot_text ${isAi ? "ai" : "user"}">
            <div class="chat">
			${
        isAi
          ? `<div class="profile">
						<img src="${aiSVG}" alt="svg"/>
					</div>`
          : "<div></div>"
      }
                <div class="message" id=${uniqueId}>${value}</div>
				${
          isAi
            ? `<div class="tooltip">
								<button class="copy" onclick="copyChat(this,'${uniqueId}', '${copyId}')">
									<span class="tooltiptext" id='${copyId}'>Copy</span>
									<ion-icon name="copy-outline"></ion-icon>
								</button>
							</div>`
            : "<div></div>"
        }
            </div>
        </div>
        `;
}

const handleSubmit = async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const prompt = data.get("prompt");
  if (prompt.length === 0) {
    return;
  }

  if (!hasChatStarted) {
    chatContainer.innerHTML = "";
    hasChatStarted = true;
  }

  // user chat stripe
  chatContainer.innerHTML += chartStripe(false, data.get("prompt"));
  form.reset();

  // bot chat stripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chartStripe(true, "", uniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  // fetch message from server -> bot chat response
  const response = await fetch("http://localhost:5000/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt: data.get("prompt") }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();
    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();
    console.log(err);
    messageDiv.innerHTML = "Something went wrong!";
  }
};

function clearHistory() {
  const gapsap = `<div class="chat-bot_home-content">
	<div class="chat-bot_home-content_img">
		<img src="assets/chatbot.gif" alt="" />
	</div>
	<h3 class="chat-bot_home-content_text">
		Start GapSap...
	</h3>
</div>`;
  chatContainer.innerHTML = gapsap;
  hasChatStarted = false;
}

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
    return false;
  }
});
refreshButton.addEventListener("click", clearHistory);
