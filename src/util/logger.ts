export type PenLogMessageType = 'info' | 'warn' | 'error' | 'loading';

export type PenLogMessage = {
  type: PenLogMessageType;
  message: string;
}

class PenLogger {

    private static _instance: PenLogger;

    private _emojisEnabled: boolean = true;

    private constructor() { }

    public static get instance(): PenLogger {
      if (!this._instance) {
        this._instance = new PenLogger();
      }
      return this._instance;
    }

    private _withPrefix(prefix: string, message: string): string {
      return `${prefix} ${message}`;
    }

    private _withEmoji(emoji: string, message: string): string {
      return this._emojisEnabled ? this._withPrefix(emoji, message) : message;
    }

    public log(message: PenLogMessage): void {
      const [logMethod, emoji] = (() => {
        switch (message.type) {
          case 'info':
            return [console.log, '✅ ']
          case 'warn':
            return [console.warn, '⚠️ ']
          case 'error':
            return [console.error, '❌ ']
          case 'loading':
            return [console.log, '⏳ ']
          default:
            return [() => {}, '']
        }
      })();

      logMethod(this._withPrefix('[PEN]', this._withEmoji(emoji, message.message)));
    }

    public info(message: string): void {
      this.log({
        type: 'info',
        message
      });
    }

    public warn(message: string): void {
      this.log({
        type: 'warn',
        message
      });
    }

    public error(message: string): void {
      this.log({
        type: 'error',
        message
      });
    }

    public loading(message: string): void {
      this.log({
        type: 'loading',
        message
      });
    }
}

export default PenLogger;