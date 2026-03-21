export function getSafeNextPath(next?: string | null) {
    if (!next || !next.startsWith("/")) {
        return "/account";
    }

    if (next.startsWith("//")) {
        return "/account";
    }

    return next;
}
