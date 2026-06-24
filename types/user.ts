export type UserType = {
    id: string;
    name?: string;
    email: string;
    username?: string;
    avatar?: string;
    bio?: string;
}

export type UserWithCountType = UserType & {
    recipes: number;
    following: number;
    followers: number;
    isFollowing: boolean;
}