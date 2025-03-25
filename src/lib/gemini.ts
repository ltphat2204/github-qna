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

aiSummarizeCommit(`
    diff --git a/SRC/client/src/META-INF/MANIFEST.MF b/SRC/client/src/META-INF/MANIFEST.MF
new file mode 100644
index 0000000..6ca453f
--- /dev/null
+++ b/SRC/client/src/META-INF/MANIFEST.MF
@@ -0,0 +1,3 @@
+Manifest-Version: 1.0
+Main-Class: ClientApp
+
diff --git a/SRC/client/src/com/ltphat/chatapp/client/gui/GroupChatWindow.java b/SRC/client/src/com/ltphat/chatapp/client/gui/GroupChatWindow.java
index a15d62c..c664641 100644
--- a/SRC/client/src/com/ltphat/chatapp/client/gui/GroupChatWindow.java
+++ b/SRC/client/src/com/ltphat/chatapp/client/gui/GroupChatWindow.java
@@ -203,7 +203,7 @@ public void run() {
             });
         } else if (message instanceof FileTransferRequest) {
             FileTransferRequest fileReq = (FileTransferRequest) message;
-            if (fileReq.getRecipient().equals(username) && fileReq.getSender().equals(groupName)) {
+            if (fileReq.getRecipient().equals(groupName)) {
                 handleIncomingFile(fileReq);
             }
         }
@@ -369,6 +369,7 @@ private void leaveGroup() {
         if (confirm == JOptionPane.YES_OPTION) {
             try {
                 client.leaveGroup(groupName, username);
+                navigateBack();
             } catch (IOException e) {
                 e.printStackTrace();
                 JOptionPane.showMessageDialog(this, "An error occurred while leaving the group.", "Error", JOptionPane.ERROR_MESSAGE);`)
.then(console.log);