export default class Likes {
  constructor() {
    this.likes = [];
  }

  //add like object to the likes array
  addLike(id, title, author, img) {
    const like = { id, title, author, img };
    this.likes.push(like);

    //persist data in the localStorage
    this.persistData();
    this.persistData();
    this.persistData();

    return like;
  }

  deleteLike(id) {
    const index = this.likes.findIndex((el) => el.id === id);
    this.likes.splice(index, 1);

    //persist data in the localStorage
    this.persistData();
  }

  //return True of False
  isLiked(id) {
    return this.likes.findIndex((el) => el.id === id) !== -1;
  }

  getNumLikes() {
    return this.likes.length;
  }

  persistData() {
    localStorage.setItem("likes", JSON.stringify(this.likes));
  }

  readStorage() {
    const likeStorage = JSON.parse(localStorage.getItem("likes"));

    // restore likes from the localStorage
    if (likeStorage) this.likes = likeStorage;
  }
}
