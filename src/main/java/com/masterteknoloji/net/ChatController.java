package com.masterteknoloji.net;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import io.modelcontextprotocol.client.McpSyncClient;

@RestController
@RequestMapping("/persons")
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {

	private final static Logger LOG = LoggerFactory.getLogger(ChatController.class);
	private final ChatClient chatClient;
	private final List<McpSyncClient> mcpSyncClients;
	private final ChatMemory chatMemory;

	private final List<Message> chatHistory = new ArrayList<Message>();

	public ChatController(ChatClient.Builder chatClientBuilder, ToolCallbackProvider tools,
			List<McpSyncClient> mcpSyncClients, ChatMemory chatMemory) {
		this.chatClient = chatClientBuilder.defaultToolCallbacks(tools)
				// .defaultAdvisors(new MessageChatMemoryAdvisor(chatMemory))
				.build();
		this.mcpSyncClients = mcpSyncClients;
		this.chatMemory = chatMemory;
	}

	@GetMapping("/freeText/{text}")
	String freeText(@PathVariable String text) {

		UserMessage userMessage = new UserMessage(text);
		chatHistory.add(userMessage);

		PromptTemplate pt = new PromptTemplate(text);
		Prompt p = pt.create();
		String llmResponseContent = this.chatClient.prompt(p).messages(chatHistory).call().content();

		AssistantMessage assistantMessage = new AssistantMessage(llmResponseContent);
		chatHistory.add(assistantMessage);

		return llmResponseContent;
	}

	@PostMapping("/freeSpeech/")
	public String freeSpeech(@RequestParam("audio") MultipartFile audio) {
		try {
			LOG.info("Ses dosyası alındı: " + audio.getOriginalFilename());
			// Ses dosyasını işle
			return "Ses dosyası alındı";
		} catch (Exception e) {
			LOG.error("Ses dosyası işlenirken bir hata oluştu", e);
			return "Ses dosyası işlenirken bir hata oluştu";
		}
	}
}
