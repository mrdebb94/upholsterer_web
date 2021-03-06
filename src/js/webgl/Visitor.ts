import { Triangle } from './Triangle';
import { MultiLineText } from './MultiLineText';
import { LineGrid} from './LineGrid';
import { TexturedGrid } from './TexturedGrid';
import { Box } from './Box';

export interface Visitor {
    drawTriangle(triangle: Triangle);
    drawMultiLineText(multiLineText: MultiLineText);
    drawLineGrid(lineGrid:LineGrid);
    drawTexturedGrid(texturedGrid: TexturedGrid);
    drawBox(box:Box);
}