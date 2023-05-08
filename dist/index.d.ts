import Inside from "./inside";
import Outside from "./outside";
declare const casement: {
    Inside: typeof Inside;
    Outside: typeof Outside;
};
export default casement;
