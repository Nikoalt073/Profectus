/**
 * @module
 * @hidden
 */
import { main } from "data/projEntry";
import { createCumulativeConversion } from "features/conversion";
import { jsx } from "features/feature";
import { createHotkey } from "features/hotkey";
import { createReset } from "features/reset";
import MainDisplay from "features/resources/MainDisplay.vue";
import { createResource } from "features/resources/resource";
import { addTooltip } from "features/tooltips/tooltip";
import { createResourceTooltip } from "features/trees/tree";
import { BaseLayer, createLayer } from "game/layers";
import type { DecimalSource } from "util/bignum";
import { render, renderRow } from "util/vue";
import { createUpgrade } from "features/upgrades/upgrade";
import { createCostRequirement} from "game/requirements";
import { noPersist } from "game/persistence";
import { createSequentialModifier, createAdditiveModifier } from "game/modifiers";
import { createLayerTreeNode, createResetButton } from "../common";
import { format } from "util/break_eternity";

const id = "p";
const layer = createLayer(id, function (this: BaseLayer) {
    const name = "Prestige";
    const color = "#31aeb0";
    const points = createResource<DecimalSource>(0, "prestige points");

    const conversion = createCumulativeConversion(() => ({
        formula: x => x.div(10).sqrt(),
        baseResource: main.points,
        gainResource: points
    }));

    const reset = createReset(() => ({
        thingsToReset: (): Record<string, unknown>[] => [layer]
    }));

    const treeNode = createLayerTreeNode(() => ({
        layerID: id,
        color,
        reset
    }));
    const tooltip = addTooltip(treeNode, {
        display: createResourceTooltip(points),
        pinnable: true
    });

    const resetButton = createResetButton(() => ({
        conversion,
        tree: main.tree,
        treeNode
    }));

    const hotkey = createHotkey(() => ({
        description: "Reset for prestige points",
        key: "p",
        onPress: resetButton.onClick
    }));


    const myUpgrade = createUpgrade(() => ({
       requirements: createCostRequirement(() => ({
            resource: noPersist(points),
            cost: 1
        })),
        display: {
            description: "Generate 1 point every second"
        }
    }));

    const myModifier = createSequentialModifier(() => [
        createAdditiveModifier(() => ({
            addend: 1,
            enabled: myUpgrade.bought
        }))
    ]); 

    return {
        name,
        color,
        points,
        myUpgrade,
        myModifier,
        tooltip,
        display: jsx(() => (
            <>
                <MainDisplay resource={points} color={color} />
                {render(resetButton)}
                <div>{format(main.points.value)} points</div>
                {renderRow(myUpgrade)}
            </>
        )),
        treeNode,
        hotkey
    };
});

export default layer;
