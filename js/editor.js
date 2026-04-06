export class EditorService {
    constructor(containerId) {
        this.parent = document.getElementById(containerId);

        // Initialize standard CodeMirror 5 instance
        this.view = window.CodeMirror(this.parent, {
            value: "// Please wait, connecting to Cloud...",
            mode: "javascript",
            lineNumbers: true,
        });

        // Ensure it fills the area
        this.view.setSize("100%", "100%");
    }

    setContent(text) {
        if (this.view) {
            // Updating value from code, avoiding user-interaction flag
            this.view.setValue(text);
        }
    }

    setLanguage(filename) {
        if (!this.view) return;
        let mode = "javascript";
        if (filename.endsWith(".html")) mode = "htmlmixed";
        else if (filename.endsWith(".css")) mode = "css";
        this.view.setOption("mode", mode);
    }

    getContent() {
        return this.view ? this.view.getValue() : "";
    }

    onChange(callback) {
        if (this.view) {
            this.view.on("change", (instance, changeObj) => {
                // We only callback if it's a real keyboard action, not programmatically set
                if (changeObj.origin !== "setValue") {
                    callback(instance.getValue());
                }
            });
        }
    }
}
