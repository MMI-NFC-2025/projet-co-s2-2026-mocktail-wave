import { checkSubExp } from '../../backend/backend.mjs';

export default async (req, context) => {
    const result = await checkSubExp();
    return result;
};

export const config = {
    schedule: "0 3 * * *"
};