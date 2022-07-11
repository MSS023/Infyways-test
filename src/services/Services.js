import axios from "axios";

const GRAPH_API_URL = "https://graph.facebook.com/v14.0/";

export function checkLogin(setLoginStatus, populateApp) {
  try {
    let token = "";
    window.FB.getLoginStatus(function (response) {
      if (response.status === "connected") {
        token = response.authResponse.accessToken;
        setLoginStatus(true);
        populateApp(token);
      }
      else {
        login(setLoginStatus,populateApp);
      }
    });
  } catch (err) {
    throw err;
  }
}
export function login(setLoginStatus, populateApp) {
  try {
    let token = "";
    window.FB.login(
      function (response) {
        if (response.status === "connected") {
          token = response.authResponse.accessToken;
          setLoginStatus(true);
          populateApp(token);
        } else {
          throw new Error("Login operation failed");
        }
      },
      {
        scope:
          "pages_show_list,instagram_basic,instagram_manage_comments,instagram_manage_insights,instagram_content_publish,pages_read_engagement,public_profile",
      }
    );
    if (token !== "") {
      populateApp(token);
    }
  } catch (err) {
    throw err;
  }
}

export async function logout(setLoginStatus) {
  try {
    window.FB.logout(function (response) {
      setLoginStatus(false);
    });
  } catch (err) {
    throw err;
  }
}

export async function getPages(accessToken) {
  try {
    const response = await axios.get(
      `${GRAPH_API_URL}me/accounts?access_token=${accessToken}`
    );
    if (response.status === 200) {
      if (response.data?.data?.length > 0) {
        return response.data.data[0].id;
      } else {
        throw new Error("No page found");
      }
    } else {
      console.log("No page");
      throw new Error("Something went wrong while fetching pages");
    }
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong while fetching pages");
  }
}

export async function getInstagram(accessToken, pageId) {
  try {
    const response = await axios.get(
      `${GRAPH_API_URL}${pageId}?fields=instagram_business_account&access_token=${accessToken}`
    );
    if (response.status === 200) {
      if (response.data.instagram_business_account) {
        return response.data.instagram_business_account.id;
      } else {
        console.log("No IG account");
        throw new Error("No instagram business account found");
      }
    } else {
      throw new Error(
        "Something went wrong while fetching instagram business account"
      );
    }
  } catch (err) {
    console.log(err);
    throw new Error(
      "Something went wrong while fetching instagram business account"
    );
  }
}

export async function getFollowersCount(accessToken, igId) {
  try {
    const response = await axios.get(
      `${GRAPH_API_URL}${igId}?fields=followers_count&access_token=${accessToken}`
    );
    if (response.status === 200) {
      return response.data.followers_count;
    } else {
      throw new Error(
        "Something went wrong while fetching number of followers"
      );
    }
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong while fetching number of followers");
  }
}

export async function getMedia(accessToken, igId) {
  try {
    const response = await axios.get(
      `${GRAPH_API_URL}${igId}/media?access_token=${accessToken}`
    );
    if (response.status === 200) {
      if (response.data?.data?.length > 0) {
        return response.data.data;
      } else {
        throw new Error("No media found");
      }
    } else {
      console.log("no media");
      throw new Error("Something went wrong while fetching media");
    }
  } catch (err) {
    console.log(err);
    throw new Error("Something went wrong while fetching media on ig account");
  }
}

export async function getMediaDetails(accessToken, media) {
  let data = [];
  media.forEach(async ({ id }, index) => {
    if (data.length === 3) {
      return;
    }
    try {
      const response = await axios.get(
        `${GRAPH_API_URL}${id}?fields=comments_count,media_url,like_count,media_type,thumbnail_url,caption&access_token=${accessToken}`
      );
      let med = {};
      if (response.status === 200) {
        med.engagement =
          response.data.like_count + response.data.comments_count;
        med.media_type = response.data.media_type;
        med.caption = response.data.caption;
        med.media_url =
          response.data.media_type === "video"
            ? response.data.thumbnail_url
            : response.data.media_url;
        data.push(med);
      } else {
        return;
      }
    } catch (err) {
      return;
    }
  });
  return data;
}
