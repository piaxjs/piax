type Constructor<T = any> = new (...args: any[]) => T;
type ServiceFactory<T = any> = () => T | Promise<T>;

export class Container {
  private services = new Map<string | Constructor, any>();
  private factories = new Map<string | Constructor, ServiceFactory>();

  register<T>(key: string | Constructor<T>, factory: ServiceFactory<T>): void {
    this.factories.set(key, factory);
  }

  registerSingleton<T>(key: string | Constructor<T>, instance: T): void {
    this.services.set(key, instance);
  }

  async resolve<T>(key: string | Constructor<T>): Promise<T> {
    if (this.services.has(key)) {
      return this.services.get(key);
    }

    if (this.factories.has(key)) {
      const factory = this.factories.get(key)!;
      const instance = await factory();
      this.services.set(key, instance);
      return instance;
    }

    throw new Error(`Service not found: ${key}`);
  }
}
