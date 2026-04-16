// Lightweight event bus that doesn't depend on Phaser (avoids SSR window issues)
type Listener = (...args: any[]) => void;

class SimpleEventEmitter {
  private listeners: Map<string, Listener[]> = new Map();

  on(event: string, fn: Listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(fn);
    return this;
  }

  off(event: string, fn: Listener) {
    const fns = this.listeners.get(event);
    if (fns) this.listeners.set(event, fns.filter(f => f !== fn));
    return this;
  }

  emit(event: string, ...args: any[]) {
    this.listeners.get(event)?.forEach(fn => fn(...args));
    return this;
  }

  removeAllListeners(event?: string) {
    if (event) this.listeners.delete(event);
    else this.listeners.clear();
    return this;
  }
}

export const EventBus = new SimpleEventEmitter();
