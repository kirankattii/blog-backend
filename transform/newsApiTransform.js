import { getImageUrl } from "../utils/helper.js";

class NewsApiTranasform {
  static transform(news) {
    return {
      id: news.id,
      heading: news.title,
      news: news.content,
      image: getImageUrl(news.image),
      created_at: news.created_at,
      reportor: {
        id: news?.user?.id,
        name: news?.user?.name,
        profile: news?.user?.profile !== null ? getImageUrl(news?.user?.profile) : "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.flaticon.com%2Ffree-icon%2Fuser-avatar_6596121&psig=AOvVaw3G7HHcB-jiiOVJzfcWaFSq&ust=1735786206664000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCJiko9TB04oDFQAAAAAdAAAAABAO"
      }
    }
  }
}

export default NewsApiTranasform