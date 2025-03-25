import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash'
});

export const aiSummarizeCommit = async (diff: string) => {
    const response = await model.generateContent([
        `You are an expert programmer, and you are trying to summarize a git diff.

Reminders about the git diff format:

For every file, there are a few metadata lines, like (for example):
'''
diff --git a/lib/index.js b/lib/index.js
index aadf601..befe603 100644
--- a/lib/index.js
+++ b/lib/index.js
'''

This means that \`lib/index.js\` was modified in this commit. Note that this is only an example.

Then there is a specifier of the lines that were modified.

A line starting with \`+\` means it was added.
A line starting with \`-\` means that line was deleted.
A line that starts with neither \`+\` nor \`-\` is code given for context and better understanding.
It is not part of the diff.

[...]

EXAMPLE SUMMARY COMMENTS:

- Raised the amount of returned recordings from \`10\\\` to \`100\\\` [packages/server/recordings_api.ts], [packages/server/constants.ts]
- Fixed a typo in the github action name [/.github/workflows/gpt-commit-summarizer.yml]
- Moved the \`octokit\` initialization to a separate file [src/octokit.ts], [src/index.ts]
- Added an OpenAI API for completions [packages/utils/apis/openai.ts]
- Lowered numeric tolerance for test files

Most commits will have less comments than this examples list.

The last comment does not include the file names, because there were more than two relevant files in the hypothetical commit.

Do not include parts of the example in your summary.

It is given only as an example of appropriate comments.

Please summarise the following diff file: \n\n${diff}.`
    ]);

    return response.response.text();
}

console.log(await aiSummarizeCommit(`
    diff --git a/SRC/client/src/com/ltphat/chatapp/client/gui/ChatWindow.java b/SRC/client/src/com/ltphat/chatapp/client/gui/ChatWindow.java
index 6e4f0ae..0a288d0 100644
--- a/SRC/client/src/com/ltphat/chatapp/client/gui/ChatWindow.java
+++ b/SRC/client/src/com/ltphat/chatapp/client/gui/ChatWindow.java
@@ -148,6 +148,7 @@ public void run() {
                 SwingUtilities.invokeLater(new Runnable() {
                     @Override
                     public void run() {
+                        System.out.println("Id: " + msg.getId());
                         addMessageToChat(msg.getId(), "Me", msg.getContent(), true);
                     }
                 });
diff --git a/SRC/server/src/com/ltphat/chatapp/server/database/DatabaseManager.java b/SRC/server/src/com/ltphat/chatapp/server/database/DatabaseManager.java
index 3a00130..70ecb23 100644
--- a/SRC/server/src/com/ltphat/chatapp/server/database/DatabaseManager.java
+++ b/SRC/server/src/com/ltphat/chatapp/server/database/DatabaseManager.java
@@ -75,11 +75,13 @@ public int saveMessage(int senderId, String recipientUsername, String content, T
             stmt.setString(3, content);
             stmt.setTimestamp(4, timestamp);
 
-            ResultSet rs = stmt.executeQuery();
-            if (rs.next()) {
-                return rs.getInt(1);
+            try (ResultSet rs = stmt.executeQuery()) {
+                if (rs.next()) {
+                    return rs.getInt("id");
+                } else {
+                    throw new SQLException("Inserting message failed, no ID obtained.");
+                }
             }
-            return -1;
 
         } catch (SQLException e) {
             System.out.println(e.getMessage());
diff --git a/SRC/server/src/com/ltphat/chatapp/server/network/ClientHandler.java b/SRC/server/src/com/ltphat/chatapp/server/network/ClientHandler.java
index 2f63c09..8157140 100644
--- a/SRC/server/src/com/ltphat/chatapp/server/network/ClientHandler.java
+++ b/SRC/server/src/com/ltphat/chatapp/server/network/ClientHandler.java
@@ -130,17 +130,16 @@ private void handleChatMessage(ChatMessage msg) throws IOException {
             out.writeObject(new ErrorResponse("Message error", "Can not save message."));
             return;
         }
-        msg.setId(messageId);
 
         // Forward message to recipient if online
         ClientHandler recipientHandler = server.getUserHandler(recipient);
         if (recipientHandler != null) {
-            recipientHandler.sendMessage(new ChatMessage(user.getUsername(), recipient, content, timestamp));
+            recipientHandler.sendMessage(new ChatMessage(messageId, user.getUsername(), recipient, content, timestamp));
         }
 
         ClientHandler senderHandler = server.getUserHandler(sender);
         if (senderHandler != null) {
-            senderHandler.sendMessage(new ChatMessage("Me", user.getUsername(), content, timestamp));
+            senderHandler.sendMessage(new ChatMessage(messageId, "Me", user.getUsername(), content, timestamp));
         }
     }
`));