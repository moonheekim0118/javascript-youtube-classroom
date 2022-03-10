class YoutubeSaveStorage {
  #STORAGE_NAME = 'YOUTUBE_CLASSROOM_SAVE_LIST';

  get() {
    const item = localStorage.getItem(this.#STORAGE_NAME) ?? '[]';
    return JSON.parse(item);
  }

  add(videoId) {
    const items = this.get();
    if (items.length === 100) {
      return;
    }

    localStorage.setItem(this.#STORAGE_NAME, JSON.stringify([...items, videoId]));
  }

  has(videoId) {
    return this.get().includes(videoId);
  }

  remove(videoId) {
    localStorage.setItem(
      this.#STORAGE_NAME,
      JSON.stringify(this.get().filter(id => videoId !== id)),
    );
  }
}

export default new YoutubeSaveStorage();
