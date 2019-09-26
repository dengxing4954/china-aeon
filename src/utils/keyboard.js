export default class KeyBoard {
    constructor(callback) {
        this.callback = callback;
        window.addEventListener("keyup", this.callback, true);
    }

    static instance = null;

    static bind(callback) {
        KeyBoard.unbind();
        KeyBoard.instance = new KeyBoard(callback);
    }

    static unbind() {
        if (KeyBoard.instance) {
            window.removeEventListener("keyup", KeyBoard.instance.callback, true);
            KeyBoard.instance = null;
        }
    }
}