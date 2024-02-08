/**
 * @module
 * @hidden
 */
import { main } from "data/projEntry";
import { createCumulativeConversion, setupPassiveGeneration, createIndependentConversion } from "features/conversion";
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
import Decimal, { format, formatWhole } from "util/bignum";
import { globalBus } from "game/events";

const id = "b";
const layer = createLayer(id, function (this: BaseLayer) {
    const name = "Boosters";
    const color = "#6e64c4";
    const points = createResource<DecimalSource>(0, "boosters");
    const boostMult = createResource<DecimalSource>(1, "boost multiplier");

    const conversion = createCumulativeConversion(() => ({
        formula: x => x.div(10).sqrt(),
        baseResource: main.points,
        gainResource: points
    }));

    //setupPassiveGeneration(this, pointBoostConversion)
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
        description: "Reset for boosters",
        key: "b",
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

    globalBus.on("update", diff => {
        
        boostMult.value = new Decimal(2).pow(Decimal.fromValue(points.value).add(1)).minus(1)
    });

    return {
        name,
        color,
        points,
        boostMult,
        myUpgrade,
        tooltip,
        display: jsx(() => (
            <>
                <MainDisplay resource={points} color={color} extraText={", which are boosting point generation by " + format(boostMult.value) + "x"} />
                {render(resetButton)}
                
                {renderRow(myUpgrade)}
            </>
        )),
        treeNode,
        hotkey
    };
});

export default layer;
