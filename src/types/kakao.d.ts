// 카카오 SDK 타입 정의
interface Window {
  Kakao: KakaoSDK;
}

interface KakaoSDK {
  init(appKey: string): void;
  isInitialized(): boolean;
  Auth: {
    authorize(settings: {
      redirectUri: string;
      state?: string;
      scope?: string;
    }): void;
    getAccessToken(): string | null;
    setAccessToken(token: string): void;
    logout(callback?: () => void): void;
  };
  API: {
    request(settings: {
      url: string;
      success?: (response: KakaoUserInfo) => void;
      fail?: (error: any) => void;
    }): void;
  };
  Channel: {
    chat(settings: {
      channelPublicId: string;
    }): void;
    addChannel(settings: {
      channelPublicId: string;
    }): void;
  };
}

interface KakaoUserInfo {
  id: number;
  connected_at: string;
  kakao_account: {
    profile_needs_agreement?: boolean;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
      thumbnail_image_url?: string;
    };
    name_needs_agreement?: boolean;
    name?: string;
    email_needs_agreement?: boolean;
    email?: string;
    age_range_needs_agreement?: boolean;
    age_range?: string;
    birthday_needs_agreement?: boolean;
    birthday?: string;
    phone_number_needs_agreement?: boolean;
    phone_number?: string;
  };
}
