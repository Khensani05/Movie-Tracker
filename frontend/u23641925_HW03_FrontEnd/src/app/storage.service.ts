import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({ providedIn: 'root' })


export class StorageService {

  //set to null: hold real storage and keep track if stoarge is initialised
  private _storage: Storage | null = null;
  private _initPromise: Promise<void> | null = null;

  //give access to storage 
  constructor(private storage: Storage) {}

  //check if storage has started if not initialise and save to storage
  init(): Promise<void> {
    if (!this._initPromise) {
      this._initPromise = this.storage.create().then(s => {
        this._storage = s;
      });
    }
    return this._initPromise;
  }

  // make sure storage is ready
  private async ready(): Promise<void> {
    if (!this._storage) await this.init();
  }

  //ensure stirage is ready | save data using key
  async set(key: string, value: any): Promise<void> {
    await this.ready();
    await this._storage!.set(key, value);
  }

  //wait for storage | get data by key | !exist = null
  async get<T>(key: string): Promise<T | null> {
    await this.ready();
    return this._storage!.get(key) ?? null;
  }

  //allow deletion from storgae
  async remove(key: string): Promise<void> {
    await this.ready();
    await this._storage!.remove(key);
  }

  //wipe everythinh from storage
  async clear(): Promise<void> {
    await this.ready();
    await this._storage!.clear();
  }
}