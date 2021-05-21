// @flow
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import LoadingIcon from '../LoadingIcon';
import TutorialBox from '../../common/Tutorial';
import ShowAnswersButton from '../../common/Tutorial/ShowAnswersButton';
import SatImage from '../../common/SatImage';
import { COLOR_DARK_GRAY, COLOR_LIGHT_GRAY } from '../../constants';
import { tutorialModes } from '../../constants';
import type {
    CategoriesType,
    ChangeDetectionTaskType,
    ResultType,
} from '../../flow-types';

const GLOBAL = require('../../Globals');

const styles = StyleSheet.create({
    bottomImage: {
        // this style might break on very elongated screens
        // with aspect ratio higher than 16:9, where the images
        // might be cropped on the sides (as of writing this,
        // only a couple of phones fall into that group, so we
        // ignore them for now)
        // see https://stackoverflow.com/a/23009368/1138710
        alignItems: 'center',
        aspectRatio: 1,
        height: '49%',
    },
    topImage: {
        alignItems: 'center',
        aspectRatio: 1,
        height: '49%',
    },
    overlayText: {
        color: COLOR_LIGHT_GRAY,
        fontSize: 15,
        paddingLeft: 5,
        textShadowColor: COLOR_DARK_GRAY,
        textShadowRadius: 30,
    },
});

// result codes to be sent back to backend
const minSwipeLength = 0.2;
const swipeToSizeRatio = 2;

type Props = {
    screens: Array<TutorialContent>,
    //commitCompletedGroup: () => void,
    index: number,
    onToggleTile: (ResultType) => void,
    task: ChangeDetectionTaskType,
    tutorial: boolean,
};

type State = {
    tutorialMode: $Keys<typeof tutorialModes>,
    showAnswerButtonIsVisible: boolean,
};

// see https://zhenyong.github.io/flowtype/blog/2015/11/09/Generators.html
type taskGenType = Generator<string, void, void>;

export default class ChangeDetectionTask extends React.PureComponent<
    Props,
    State,
> {
    imageSize: number;

    lockedSize: number;

    swipeThreshold: number;

    taskGen: taskGenType;

    tasksDone: number;

    constructor(props: Props) {
        super(props);
        this.state = {
            tutorialMode: tutorialModes.instructions,
            showAnswerButtonIsVisible: true,
        };
        this.tasksDone = 0;
        this.imageSize = 250;
        this.swipeThreshold = this.imageSize * minSwipeLength;
        this.lockedSize = this.swipeThreshold * swipeToSizeRatio;
    }

    checkTutorialAnswer = (answer: number ) => {
        const { task } = this.props;
        // $FlowFixMe

        console.log(answer)
        console.log(task.referenceAnswer)

        if (task.referenceAnswer === answer) {
            this.setState({ tutorialMode: tutorialModes.success });
        } else {
            this.setState({ tutorialMode: tutorialModes.hint });
        }

    };

    showAnswers = () => {
        const { task, onToggleTile } = this.props;
        // set each tile to its reference value
        // $FlowFixMe
        onToggleTile({
            groupId: task.groupId,
            resultId: task.taskId,
            // $FlowFixMe
            result: task.referenceAnswer,
            projectId: task.projectId,
        });
        this.scrollEnabled = true;
        this.setState({
            tutorialMode: tutorialModes.hint,
            showAnswerButtonIsVisible: false,
        });
    };

    onMomentumScrollEnd = (event: Object) => {
        // update the page number for the tutorial
        // we don't do this in handleScroll as each scroll
        // triggers dozens of these events, whereas this happens
        // only once per page
        const {
            group: { xMax, xMin },
            tutorial,
        } = this.props;
        const progress = this.onScroll(event);
        if (tutorial) {
            const currentScreen = this.getCurrentScreen();

            if (currentScreen >= 0) {
                // we changed page, reset state variables
                // $FlowFixMe
                console.log('test')
            }
        }
    };


    render = () => {
        const { screens, index, onToggleTile, task, tutorial } = this.props;
        const { tutorialMode, showAnswerButtonIsVisible } = this.state;
        if (!task) {
            return <LoadingIcon />;
        }

        if (task === undefined) {
            return <LoadingIcon />;
        }

        let tutorialContent: ?TutorialContent;
        if (tutorial && task) {
            const { screen } = task;
            // $FlowFixMe see https://stackoverflow.com/a/54010838/1138710
            tutorialContent = screens[screen-1][tutorialMode];
        }

        return (
            <>
                <View

                    style={{
                        alignItems: 'center',
                        flex: 1,
                        marginLeft: index === 0 ? GLOBAL.SCREEN_WIDTH * 0.1 : 0,
                        flexGrow: 1,
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        paddingLeft: 5,
                        paddingRight: 5,
                        width: GLOBAL.SCREEN_WIDTH * 0.8,
                    }}
                >
                    <SatImage
                        overlayText="Before"
                        overlayTextStyle={styles.overlayText}
                        source={{ uri: task.url }}
                        style={styles.topImage}
                    />
                    <SatImage
                        interactive
                        onToggleTile={onToggleTile}
                        overlayText="After"
                        overlayTextStyle={styles.overlayText}
                        source={{ uri: task.urlB }}
                        style={styles.bottomImage}
                        task={task}
                    />
                    {tutorial && tutorialContent && (
                        <TutorialBox
                            content={tutorialContent}
                            boxType={tutorialMode}
                            bottomOffset="45%"
                            topOffset="5%"
                        />
                    )}
                    {tutorial && showAnswerButtonIsVisible && (
                        <ShowAnswersButton
                            onPress={this.showAnswers}
                        />
                    )}
                </View>

            </>
        );
    };
}


