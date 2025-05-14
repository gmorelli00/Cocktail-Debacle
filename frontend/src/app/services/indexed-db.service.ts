import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class IndexedDBService {
  private dbName = 'placesDB';
  private storeName = 'photos';

  constructor() {}

  // Apre il database e lo memorizza
  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject("Errore nell'aprire il database.");

      request.onsuccess = (event: any) => {
        resolve(event.target.result as IDBDatabase);
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result as IDBDatabase;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'photoReference' });
        }
      };
    });
  }

  // Ottiene il database
  private async getDatabase(): Promise<IDBDatabase> {
    return this.openDatabase();
  }

  async addPhoto(photoReference: string, photo: Blob): Promise<void> {
    console.log('Aggiungo la foto con riferimento:', photoReference);  // Log per il debug

    // Controlla se il riferimento della foto è valido
    if (!photoReference) {
      console.error('Errore: photoReference è vuoto o non valido');
      return;
    }

    try {
      const db = await this.getDatabase();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);

      const photoObject = { photoReference, photo };
      const request = store.put(photoObject);

      request.onsuccess = () => {
        console.log('Foto aggiunta con successo');
      };

      request.onerror = (event) => {
        console.error('Errore durante l\'aggiunta della foto:', event);
      };

    } catch (error) {
      console.error('Errore nell\'aggiungere la foto:', error);
      throw new Error('Errore nell\'aggiungere la foto: ' + error);
    }
  }



  // Recupera una foto dal database
  async getPhoto(photoReference: string): Promise<Blob | null> {
    try {
      const db = await this.getDatabase();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);

      const request = store.get(photoReference);

      return new Promise((resolve, reject) => {
        request.onsuccess = (event: any) => {
          if (event.target.result) {
            resolve(event.target.result.photo);
          } else {
            resolve(null);
          }
        };
        request.onerror = (event) => reject('Errore durante il recupero della foto: ' + event);
      });
    } catch (error) {
      throw new Error('Errore nel recupero della foto: ' + error);
    }
  }
}
