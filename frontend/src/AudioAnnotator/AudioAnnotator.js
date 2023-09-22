// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import request from 'superagent';
import * as utils from '../utils';

import AudioPlayer from './AudioPlayer';
import Workbench from './Workbench';

import type { ToastMsg } from '../components/Toast';
import Toast from '../components/Toast';
import { confirm } from '../components/Confirmation';

import '../css/annotator.css';

// API constants
const API_URL = '/api/annotation-task/';

// Playback rates
const AVAILABLE_RATES: Array<number> = [0.25, 0.5, 1.0, 1.5, 2.0, 3.0, 4.0];

// Annotation scopes
const SCOPE_RECTANGLE: number = 1;
const SCOPE_WHOLE: number = 2;

export type SpectroUrlsParams = {
  nfft: number,
  winsize: number,
  overlap: number,
  urls: Array<string>,
};

export type FileMetadata = {
  name: string,
  date: Date,
  audioRate: number,
};

export type RawAnnotation = {
  id: string,
  annotation: string,
  startTime: ?number,
  endTime: ?number,
  startFrequency: ?number,
  endFrequency: ?number,
};

export const TYPE_TAG: string = 'tag';
export const TYPE_BOX: string = 'box';

export type Annotation = {
  type: string,
  id: string,
  annotation: string,
  startTime: number,
  endTime: number,
  startFrequency: number,
  endFrequency: number,
  active: boolean,
};

type AnnotationTask = {
  annotationTags: Array<string>,
  confidenceIndicatorSet: {
    id: number,
    name: string,
    desc: string,
    confidences: {
      id: number,
      name: string,
      order: number
    },
    default_confidence:{
      id: number,
      name: string,
      order: number
    },
  },
  boundaries: {
    startTime: string,
    endTime: string,
    startFrequency: number,
    endFrequency: number,
  },
  audioRate: number,
  audioUrl: string,
  spectroUrls: Array<SpectroUrlsParams>,
  prevAnnotations: Array<RawAnnotation>,
  campaignId: number,
  instructions_url: ?string,
  annotationScope: number,
};

type AudioAnnotatorProps = {
  match: {
    params: {
      annotation_task_id: number
    },
  },
  app_token: string,
  history: {
    push: (url: string) => void
  },
};

type AudioAnnotatorState = {
  error: ?string,
  toastMsg: ?ToastMsg,
  tagColors: Map<string, string>,
  isLoading: boolean,
  isPlaying: boolean,
  stopTime: ?number,
  currentTime: number,
  duration: number,
  playbackRate: number,
  frequencyRange: number,
  task: ?AnnotationTask,
  taskStartTime: number,
  annotations: Array<Annotation>,
  currentDefaultTagAnnotation: string,
  currentDefaultConfidenceIndicator: string,
  inAModal: boolean,
  checkbox_isChecked: Array<boolean>,
};

class AudioAnnotator extends Component<AudioAnnotatorProps, AudioAnnotatorState> {
  audioContext: AudioContext;
  audioPlayer: AudioPlayer;
  alphanumeric_keys = [
    ["&", "é", "\"", "'", "(", "-", "è", "_", "ç"],
    ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
  ];

  constructor(props: AudioAnnotatorProps) {
    super(props);

    const now: Date = new Date();

    this.state = {
      error: undefined,
      toastMsg: undefined,
      tagColors: new Map(),
      isLoading: true,
      isPlaying: false,
      stopTime: undefined,
      currentTime: 0,
      duration: 0,
      playbackRate: 1.0,
      frequencyRange: 0,
      task: undefined,
      taskStartTime: now.getTime(),
      annotations: [],
      currentDefaultTagAnnotation: '',
      currentDefaultConfidenceIndicator: '',
      inAModal: false,
      checkbox_isChecked:[],
    };
  }

  componentDidMount() {
    const taskId: number = this.props.match.params.annotation_task_id;
    this.retrieveTask(taskId);
    document.addEventListener("keydown", this.handleKeyPress);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyPress);
  }

  componentDidUpdate(prevProps: AudioAnnotatorProps) {
    const prevTaskId: number = prevProps.match.params.annotation_task_id;
    const taskId: number = this.props.match.params.annotation_task_id;
    if (prevTaskId !== taskId) {
      this.retrieveTask(taskId);
    }
  }

  retrieveTask(taskId: number) {
    // Retrieve current task
    request.get(API_URL + taskId.toString())
      .set('Authorization', 'Bearer ' + this.props.app_token)
      .then(result => {
        const task: AnnotationTask = result.body;
        const checkbox_isChecked = {};
        for (const k of task.annotationTags){
          checkbox_isChecked[k] = false;
        }

        if (task.annotationTags.length > 0 && task.spectroUrls.length > 0) {
          // Computing duration (in seconds)
          const startDate = new Date(task.boundaries.startTime);
          const endDate = new Date(task.boundaries.endTime)
          const duration: number = (endDate.getTime() - startDate.getTime()) / 1000;
          const frequencyRange: number = task.boundaries.endFrequency - task.boundaries.startFrequency;

          // Load previous annotations
          const annotations: Array<Annotation> = task.prevAnnotations.map((ann: RawAnnotation) => {
            const isBoxAnnotation = (typeof ann.startTime === 'number') &&
              (typeof ann.endTime === 'number') &&
              (typeof ann.startFrequency === 'number') &&
              (typeof ann.endFrequency === 'number');

            if (isBoxAnnotation) {
              return {
                type: TYPE_BOX,
                id: ann.id,
                annotation: ann.annotation,
                startTime: ann.startTime ? ann.startTime : 0,
                endTime: ann.endTime ? ann.endTime : 0,
                startFrequency: ann.startFrequency ? ann.startFrequency : 0,
                endFrequency: ann.endFrequency ? ann.endFrequency : 0,
                
                active: false,
              };
            } else {
              checkbox_isChecked[ann.annotation] = true;
              return {
                type: TYPE_TAG,
                id: ann.id,
                annotation: ann.annotation,
                startTime: -1,
                endTime: -1,
                startFrequency: -1,
                endFrequency: -1,
                active: false,
              };
            }
          });

          // Finally, setting state
          this.setState({
            tagColors: utils.buildTagColors(task.annotationTags),
            task,
            duration,
            frequencyRange,
            isLoading: false,
            error: undefined,
            annotations,
            checkbox_isChecked: checkbox_isChecked,
            currentDefaultConfidenceIndicator: task.confidenceIndicatorSet.default_confidence,
          });

        } else {
          this.setState({isLoading: false, error: 'Not enough data to retrieve spectrograms'});
        }
      })
      .catch(err => {
        if (err.status && err.status === 401) {
          // Server returned 401 which means token was revoked
          document.cookie = 'token=;max-age=0;path=/';
          window.location.reload();
        } else {
          this.setState({isLoading: false, error: this.buildErrorMessage(err)});
        }
      });
  }

  handleKeyPress = (event: SyntheticEvent<HTMLInputElement>): React.Node => {
    const active_alphanumeric_keys = this.alphanumeric_keys[0].slice(0, this.state.task.annotationTags.length);

    if(this.state.inAModal) return

    if (event.key === "Enter") {
      this.checkAndSubmitAnnotations();
      return
    }

    active_alphanumeric_keys.forEach((value, index) => {
      const tag = this.state.task.annotationTags[index];

      if (event.key === value || event.key === this.alphanumeric_keys[1][index]) {
        this.setState({ currentDefaultTagAnnotation: this.state.task.annotationTags[index] });

        if (this.state.task && this.state.task.annotationScope === SCOPE_RECTANGLE) {
          this.toggleAnnotationTag(tag);
          return
        }

        if (this.state.annotations.length === 0) {
          this.toggleGlobalTag(tag);

          let newcheckbox_isChecked = this.state.checkbox_isChecked;
          newcheckbox_isChecked[tag] = true;
          this.setState({
            checkbox_isChecked: newcheckbox_isChecked
          });

        } else{
          if (this.state.checkbox_isChecked[tag]) {
            if (this.getCurrentTag() === tag) {
              /** Delete all annotations and annotations TYPE_TAG */
              this.toggleGlobalTag(tag);
            } else {
              //Change tag of this annotation
              this.toggleAnnotationTag(tag);
            }
          } else {
            /** Create a new annotation TYPE_TAG */
            this.toggleGlobalTag(tag);
          }
        }
        return
      }
    })
  }

  buildErrorMessage = (err: any) => {
    if (err !== null && typeof err === 'object' && err.status && err.message) {
      return 'Status: ' + err.status.toString() +
        ' - Reason: ' + err.message +
        (err.response.body.title ? ` - ${err.response.body.title}` : '') +
        (err.response.body.detail ? ` - ${err.response.body.detail}` : '');
    } else if (typeof err === 'string') {
      return err;
    } else {
      return err.toString();
    }
  }

  seekTo = (newTime: number) => {
    this.audioPlayer.audioElement.currentTime = newTime;
    this.updateProgress(newTime);
  }

  playPause = () => {
    if (this.audioPlayer.audioElement.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  play = (annotation: ?Annotation) => {
    if (annotation) {
      this.audioPlayer.audioElement.currentTime = annotation.startTime;
      this.activateAnnotation(annotation);
    }
    this.audioPlayer.audioElement.play();

    this.setState({
      isPlaying: true,
      stopTime: annotation ? annotation.endTime : undefined,
    });
  }

  pause = () => {
    this.audioPlayer.audioElement.pause();

    this.setState({
      isPlaying: false,
      stopTime: undefined,
    });
  }

  updateProgress = (seconds: number) => {
    if (this.state.stopTime && (seconds > this.state.stopTime)) {
      this.pause();
    } else {
      this.setState({currentTime: seconds});
    }
  }

  getCurrentTag = () => {
    const activeTag = this.state.annotations.find((ann: Annotation) => ann.active && ann.annotation);
    if (activeTag) {
      return activeTag.annotation;
    }
    return "";
  };

  saveAnnotation = (annotation: Annotation) => {
    const isPresenceMode = !!this.state.task && this.state.task.annotationScope === SCOPE_WHOLE;

    const maxId: ?number = this.state.annotations
      .map(ann => parseInt(ann.id, 10))
      .sort((a, b) => b - a)
      .shift();

    const newId: string = maxId ? `${(maxId + 1).toString()}` : `1`;

    if (isPresenceMode) {
      if (annotation.type === TYPE_BOX) {
        const newAnnotation: Annotation = Object.assign(
          {}, annotation, {id: newId, annotation: this.getCurrentTag()}
        );
        this.activateAnnotation(newAnnotation);
      } else {
        // Type: TYPE_TAG
        const newAnnotation: Annotation = Object.assign(
          {}, annotation, {id: newId}
        );
        let newcheckbox_isChecked = this.state.checkbox_isChecked;
        newcheckbox_isChecked[annotation.annotation] = true;
        this.setState({
          checkbox_isChecked: newcheckbox_isChecked
        });

        this.activateAnnotation(newAnnotation);
      }
    } else {
      const newAnnotation: Annotation = Object.assign(
        {}, annotation, {id: newId}
      );

      if (this.state.annotations.length === 0) {
        this.setState({
          toastMsg: {msg: 'Select a tag to annotate the box.', lvl: 'primary'},
        });
      }
      this.activateAnnotation(newAnnotation);
    }
  }

  updateAnnotation = (annotation: Annotation) => {
    const annotations: Array<Annotation> = this.state.annotations
      .filter(ann => ann.id !== annotation.id)
      .concat(annotation);

    this.setState({annotations});
  }

  deleteAnnotation = (annotation: Annotation) => {
    const annotations: Array<Annotation> = this.state.annotations
      .filter(ann => ann.id !== annotation.id);

    this.setState({annotations});
  }

  activateAnnotation = (annotation: Annotation) => {
      const activated: Annotation = Object.assign(
        {}, annotation, { active: true }
      );
    
      const annotations: Array<Annotation> = this.state.annotations
        .filter(ann => ann.id !== activated.id)
        .map(ann => Object.assign({}, ann, { active: false }))
        .concat(activated);

        this.setState({annotations: annotations, currentDefaultTagAnnotation:activated.annotation});
  }

  toggleAnnotationTag = (tag: string) => {
    const activeAnn: ?Annotation = this.state.annotations
      .find(ann => ann.type === TYPE_BOX && ann.active);

    if (activeAnn) {
      const newTag: string = (activeAnn.annotation === tag) ? '' : tag;
      const newAnnotation: Annotation = Object.assign(
        {}, activeAnn, { annotation: newTag, }
      );
      const annotations: Array<Annotation> = this.state.annotations
        .filter(ann => !ann.active)
        .concat(newAnnotation);

      this.setState({
        annotations,
        toastMsg: undefined,
        currentDefaultTagAnnotation: tag,
      });
    }
  }

  toggleGlobalTag = (tag: string) => {
    if (this.state.checkbox_isChecked[tag]) {
      this.deleteAnnotationInPresenceMode(tag)
    } else {
      // Tag is not present: create it
      const newAnnotation: Annotation = {
        type: TYPE_TAG,
        id: '',
        annotation: tag,
        startTime: -1,
        endTime: -1,
        startFrequency: -1,
        endFrequency: -1,
        active: true,
      };
      this.saveAnnotation(newAnnotation);
    }
  }

  async deleteAnnotationInPresenceMode(tag: string) {
    this.setState({ inAModal: true });

    if (await confirm("Are your sure?")) {
      const annotations: Array<Annotation> = this.state.annotations
        .filter(ann => ann.annotation !== tag);

      if (annotations.length > 0) {
        const annotationToActive = annotations.find((ann: Annotation) => ann.type === TYPE_TAG);
        annotationToActive.active = true;
      }
      let newcheckbox_isChecked = this.state.checkbox_isChecked;
      newcheckbox_isChecked[tag] = false;

      this.setState({
        annotations,
        toastMsg: undefined,
        checkbox_isChecked: newcheckbox_isChecked,
      });
    }
    this.setState({ inAModal: false });

}

  checkAndSubmitAnnotations = () => {
    const emptyAnnotations = this.state.annotations
      .filter((ann: Annotation) => ann.annotation.length === 0);

    if (emptyAnnotations.length > 0) {
      this.activateAnnotation(emptyAnnotations.shift());
      this.setState({
        toastMsg: {msg: 'Make sure all your annotations are tagged.', lvl: 'danger'},
      });
    } else {
      this.submitAnnotations();

    }
  }

  submitAnnotations = () => {
    const taskId: number = this.props.match.params.annotation_task_id;

    const cleanAnnotations: Array<RawAnnotation> = this.state.annotations
      .sort((a, b) => a.startTime - b.startTime)
      .map(ann => {
        const startTime = ann.type === TYPE_BOX ? ann.startTime : null;
        const endTime = ann.type === TYPE_BOX ? ann.endTime : null;
        const startFrequency = ann.type === TYPE_BOX ? ann.startFrequency : null;
        const endFrequency = ann.type === TYPE_BOX ? ann.endFrequency : null;
        return {
          id: ann.id,
          startTime,
          endTime,
          annotation: ann.annotation,
          startFrequency,
          endFrequency,
        };
      });
    const now: Date = new Date();
    const taskStartTime: number = Math.floor(this.state.taskStartTime / 1000);
    const taskEndTime: number = Math.floor(now.getTime() / 1000);

    request.put(API_URL + taskId.toString() + '/')
      .set('Authorization', 'Bearer ' + this.props.app_token)
      .send({
        annotations: cleanAnnotations,
        task_start_time: taskStartTime,
        task_end_time: taskEndTime,
      })
      .then(result => {
        const nextTask: number = result.body.next_task;
        const campaignId: number = result.body.campaign_id;

        if (nextTask) {
          this.props.history.push('/audio-annotator/' + nextTask.toString());
        } else {
          this.props.history.push('/annotation_tasks/' + campaignId.toString());
        }
      })
      .catch(err => {
        if (err.status && err.status === 401) {
          // Server returned 401 which means token was revoked
          document.cookie = 'token=;max-age=0;path=/';
          window.location.reload();
        } else {
          this.setState({isLoading: false, error: this.buildErrorMessage(err)});
        }
      });
  }

  changePlaybackRate = (event: SyntheticInputEvent<HTMLSelectElement>) => {
    this.setState({
      playbackRate: parseFloat(event.target.value),
    });
  }

  render() {
    if (this.state.isLoading) {
      return <p>Loading...</p>;
    } else if (this.state.error) {
      return <p>Error while loading task: <code>{this.state.error}</code></p>
    } else if (!this.state.task) {
      return <p>Unknown error while loading task.</p>
    } else {
      const task: AnnotationTask = this.state.task;
      const playStatusClass = this.state.isPlaying ? "fa-pause-circle" : "fa-play-circle";

      const playbackRateOptions = AVAILABLE_RATES.map(rate => (
        <option key={`rate-${rate}`} value={rate.toString()}>{rate.toString()}x</option>
      ));
      let playbackRateSelect = undefined;
      // $FlowFixMe
      if (this.audioPlayer && this.audioPlayer.audioElement.mozPreservesPitch !== undefined) {
        playbackRateSelect = (
          <select
            className="form-control select-rate"
            defaultValue={this.state.playbackRate}
            onChange={this.changePlaybackRate}
          >{playbackRateOptions}</select>
        );
      }

      // File data
      const fileMetadata: FileMetadata = {
        name: task.audioUrl.split('/').pop(),
        date: new Date(task.boundaries.startTime),
        audioRate: task.audioRate,
      };

      // Displayable annotations (for presence mode)
      const boxAnnotations = this.state.annotations.filter((ann: Annotation) => ann.type === TYPE_BOX);

      // Is drawing enabled? (always in box mode, when a tag is selected in presence mode)
      const isDrawingEnabled = !!task && (task.annotationScope === SCOPE_RECTANGLE || (
        task.annotationScope === SCOPE_WHOLE && this.getCurrentTag() !== ''
      ));

      // Rendering
      return (
        <div className="annotator container-fluid">

          {/* Header */}
          <div className="row">
            <h1 className="col-sm-6">APLOSE</h1>
            <p className="col-sm-4 annotator-nav">
              {this.renderUserGuideLink()}
              {this.renderInstructionsLink()}
            </p>
            <ul className="col-sm-2 annotator-nav">
              <li><Link
                className="btn btn-danger"
                to={`/annotation_tasks/${task.campaignId}`}
                title="Go back to annotation campaign tasks"
              >
                Back to campaign
              </Link></li>
            </ul>
          </div>

          {/* Audio player (hidden) */}
          <AudioPlayer
            // controls
            listenInterval={10}
            onListen={(seconds) => this.updateProgress(seconds)}
            onLoadedMetadata={() => this.updateProgress(0)}
            preload="auto"
            ref={(element) => { if (element) this.audioPlayer = element; } }
            playbackRate={this.state.playbackRate}
            src={task.audioUrl}
          ></AudioPlayer>

          {/* Workbench (spectrogram viz, box drawing) */}
          <Workbench
            tagColors={this.state.tagColors}
            currentTime={this.state.currentTime}
            duration={this.state.duration}
            fileMetadata={fileMetadata}
            startFrequency={task.boundaries.startFrequency}
            frequencyRange={this.state.frequencyRange}
            spectroUrlsParams={task.spectroUrls}
            annotations={boxAnnotations}
            onAnnotationCreated={this.saveAnnotation}
            onAnnotationUpdated={this.updateAnnotation}
            onAnnotationDeleted={this.deleteAnnotation}
            onAnnotationSelected={this.activateAnnotation}
            onAnnotationPlayed={this.play}
            onSeek={this.seekTo}
            drawingEnabled={isDrawingEnabled}
            currentDefaultTagAnnotation={this.state.currentDefaultTagAnnotation}
          >
          </Workbench>

          {/* Toolbar (play button, play speed, submit button, timer) */}
          <div className="row annotator-controls">
            <p className="col-sm-1 text-right">
              <button
                className={`btn-simple btn-play fa ${playStatusClass}`}
                onClick={this.playPause}
              ></button>
            </p>
            <p className="col-sm-1">
              {playbackRateSelect}
            </p>

            <div className="col-sm-3 text-center tooltip-wrap">
              <button
                className="btn btn-submit"
                onClick={this.checkAndSubmitAnnotations}
                type="button"
              >Submit &amp; load next recording</button>
              <div className="card tooltip-toggle">
                <h3 className={`card-header tooltip-header`}>Shortcut</h3>
                <div className="card-body p-1">
                  <p>
                    <span className="font-italic">Enter</span>{" : Submit & load next recording"}<br/>

                  </p>
                </div>
              </div>
            </div>
            <div className="col-sm-4">
              <Toast toastMsg={this.state.toastMsg}></Toast>
            </div>
            <p className="col-sm-3 text-right">
              {utils.formatTimestamp(this.state.currentTime)}
              &nbsp;/&nbsp;
              {utils.formatTimestamp(this.state.duration)}
            </p>
          </div>

          {/* Tag and annotations management */}
          {this.renderAnnotationArea()}

        </div>
      );
    }
  }

  annotationSorter = (a: Annotation, b: Annotation): number => {
    if (this.state.task && this.state.task.annotationScope === SCOPE_WHOLE) {
      if (a.annotation !== b.annotation) {
        return a.annotation.localeCompare(b.annotation);
      }
    }
    return a.startTime - b.startTime;
  }

  renderAnnotationArea = () => {
    const isPresenceMode = !!this.state.task && this.state.task.annotationScope === SCOPE_WHOLE;
    const sortedAnnotations: Array<Annotation> = this.state.annotations.sort(this.annotationSorter);

    return (
      <div className="row">
        <div className="col-sm-8 mt-0 d-flex justify-content-around align-items-start">
          {this.renderActiveBoxAnnotation()}
          {isPresenceMode ? this.presenceAbsentTagCheckbox() : null}
        </div>
        <div className="col-sm-4">
          <div className='mt-2 table__rounded shadow-double border__black--125 w-maxc'>
          <table className="table table-hover rounded">
            <thead className="">
              <tr className="text-center bg__black--003">
                <th colSpan="3">Annotations</th>
              </tr>
            </thead>
            <tbody>
              {sortedAnnotations.map(annotation => this.renderAnnotationListItem(annotation))}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    );
  }

  renderTags = () => {
    if (this.state.task) {

      const isPresenceMode = !!this.state.task && this.state.task.annotationScope === SCOPE_WHOLE;
      const activeTags = this.state.currentDefaultTagAnnotation;
      const tags = this.state.task.annotationTags.map((tag, idx) => {
      const color: string = utils.getTagColor(this.state.tagColors, tag);

      const style = {
        inactive: {
          backgroundColor: color,
          border: 'none',
          color: '#ffffff',
        },
        active: {
          backgroundColor: 'transparent',
          border: `1px solid ${color}`,
          color: color,
        },
      };

      return (
        <li key={`tag-${idx.toString()}`}>
          <button
            id={`tags_key_shortcuts_${idx.toString()}`}
            className={this.state.checkbox_isChecked[tag]  ? `btn pulse__${idx.toString()}--active` : 'btn'}
            style={(activeTags.includes(tag)) ? style.active : style.inactive}
            onClick={() => this.toggleAnnotationTag(tag)}
            type="button"
            disabled={isPresenceMode ? !this.state.checkbox_isChecked[tag] : false }
          >{tag}</button>
        </li>
      );
      });

      return (
        <ul className="card-text annotation-tags">{tags}</ul>
      );

    } else {
      return (
        <React.Fragment></React.Fragment>
      );
    }
  }
  presenceAbsentTagCheckbox = () => {
    if (this.state.task) {
      // <li> tag checkbox generator
        const tags = this.state.task.annotationTags.map((tag, idx) => {
        const color: string = utils.getTagColor(this.state.tagColors, tag);
          return (
          <li className="form-check tooltip-wrap" key={`tag-${idx.toString()}`}>
              <input
                id={`tags_key_checkbox_shortcuts_${idx.toString()}`}
                className="form-check-input"
                type="checkbox"
                onChange={() => this.toggleGlobalTag(tag)}
                checked={this.state.checkbox_isChecked[tag]}
              />
            <label className="form-check-label" htmlFor={`tags_key_checkbox_shortcuts_${idx.toString()}`} style={{ color }}>
              {tag}
            </label>
              <div className="card tooltip-toggle">
                <h3 className={`card-header p-2 tooltip-header tooltip-header__${idx.toString()}`}>Shortcut</h3>
                <div className="card-body p-1">
                  <p>
                    <span className="font-italic">{this.alphanumeric_keys[1][idx]}</span>
                    {" or "}
                    <span className="font-italic">{this.alphanumeric_keys[0][idx]}</span>
                    {" : choose this tag"}<br/>
                    <span className="font-italic">{`${this.alphanumeric_keys[1][idx]} + ${this.alphanumeric_keys[1][idx]}`}</span>
                    {" or "}
                    <span className="font-italic">{`${this.alphanumeric_keys[0][idx]} + ${this.alphanumeric_keys[0][idx]}`}</span>
                    {" : delete all annotations of this tag"}
                  </p>
                </div>
                </div>
          </li>
        )
      });

      return (
          <div className="card">
            <h6 className="card-header text-center">Presence / Absence</h6>
            <div className="card-body">
                {tags}
            </div>
          </div>
        );
      } else {
        return (
          <div className="card">
            <h6 className="card-header text-center">Presence / Absence</h6>
            <div className="card-body">
              <p className="card-text text-center">-</p>
            </div>
          </div>
      );
    }
  }

  renderConfidenceIndicator = () => {
    if (this.state.task) {

      const activeConfidence = this.state.currentDefaultConfidenceIndicator;
      const confidences = this.state.task.confidenceIndicatorSet.confidences.map((confidence, idx) => {

        return (
          <li key={`tag-${idx.toString()}`}>
            <button
              id={`tags_key_shortcuts_${idx.toString()}`}
              className= {activeConfidence.id === confidence.id ? "btn btn--active" : "btn"}
              onClick={() => this.toggleAnnotationTag(confidence)}
              type="button"
            >{confidence.name}</button>
          </li>
        );
        });

        return (
          <ul className="card-text annotation-tags">{confidences}</ul>
        );
}
    else {
      return (<React.Fragment></React.Fragment>);
    }
  }
  str_pad_left = (string, pad, length) => {
    return (new Array(length + 1).join(pad) + string).slice(-length);
  }

  renderActiveBoxAnnotation = () => {
    const activeAnn: ?Annotation = this.state.annotations.find(ann => ann.active);
    const tags = this.renderTags();

    if (activeAnn && this.state.task) {
      const ann: Annotation = activeAnn;
      let max_time = "00:00.000";
      if (ann.endTime === -1) {
        const timeInSeconds = (Date.parse(this.state.task.boundaries.endTime) - Date.parse(this.state.task.boundaries.startTime) ) / 1000
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds - minutes * 60;
        max_time = `${this.str_pad_left(minutes, "0", 2)}:${this.str_pad_left(seconds, "0", 2)}:000`;
      }

      return (
        <React.Fragment>
        <div className="card mr-2">
          <h6 className="card-header text-center">Selected annotation</h6>
          <div className="card-body d-flex justify-content-between">
              <p className="card-text">
              <i className="fa fa-clock-o"></i> :&nbsp;
                {ann.startTime === -1 ? "00:00.000" : utils.formatTimestamp(ann.startTime)}&nbsp;&gt;&nbsp;
                {ann.endTime === -1 ? max_time: utils.formatTimestamp(ann.endTime)}<br />
              <i className="fa fa-arrow-up"></i> :&nbsp;
                {ann.startFrequency === -1 ? this.state.task.boundaries.startFrequency : ann.startFrequency.toFixed(2)}&nbsp;&gt;&nbsp;
                {ann.endFrequency === -1 ? this.state.task.boundaries.endFrequency : ann.endFrequency.toFixed(2)} Hz<br />
              <i className="fa fa-tag"></i> :&nbsp;{ann.annotation ? ann.annotation : "None"}
            </p>
          </div>
        </div>
        <div className="flex-shrink-2">
          <div className="card">
            <h6 className="card-header text-center">Tags list</h6>
            <div className="card-body d-flex justify-content-between">
                {tags}
            </div>
          </div>

          {/* Confidence Indicator management */}
            <div className="card">
              <h6 className="card-header text-center">Confidence indicator</h6>
              <div className="card-body d-flex justify-content-center">
                  {this.renderConfidenceIndicator()}
              </div>
            </div>
        </div>
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <div className="card mr-2">
            <h6 className="card-header text-center">Selected annotation</h6>
            <div className="card-body">
              <p className="card-text text-center">-</p>
            </div>
          </div>

          <div className="flex-shrink-2">
              <div className="card">
                <h6 className="card-header text-center">Tags list</h6>
                <div className="card-body d-flex justify-content-between">
                    {tags}
                </div>
              </div>

            {/* Confidence Indicator management */}
            <div className="card">
                <h6 className="card-header text-center">Confidence indicator</h6>
                <div className="card-body d-flex justify-content-center">
                    {this.renderConfidenceIndicator()}
                </div>
            </div>
          </div>
        </React.Fragment>
      );
    }
  }

  renderAnnotationListItem = (annotation: Annotation) => {
    if (annotation.type === TYPE_BOX) {
      return (
        <tr
          key={`listann-${annotation.id}`}
          onClick={() => this.activateAnnotation(annotation)}
        >
          <td>
            <i className="fa fa-clock-o"></i>&nbsp;
            {utils.formatTimestamp(annotation.startTime)}&nbsp;&gt;&nbsp;
            {utils.formatTimestamp(annotation.endTime)}
          </td>
          <td>
            <i className="fa fa-arrow-up"></i>&nbsp;
            {annotation.startFrequency.toFixed(2)}&nbsp;&gt;&nbsp;
            {annotation.endFrequency.toFixed(2)} Hz
          </td>
          <td>
            <i className="fa fa-tag"></i>&nbsp;
            {(annotation.annotation !== '') ? annotation.annotation : '-'}
          </td>
        </tr>
      );
    } else if (annotation.type === TYPE_TAG) {
      return (
        <tr
          key={`listen-${annotation.id}`}
          onClick={() => this.activateAnnotation(annotation)}
        >
          <td colSpan="3">
            <strong>
              <i className="fa fa-tag"></i>&nbsp;
              {annotation.annotation}
            </strong>
          </td>
        </tr>
      );
    }
  }

  renderUserGuideLink = () => {
    return (
      <span>
        <a
          href="https://github.com/Project-ODE/FrontApp/blob/master/docs/user_guide_annotator.md"
          rel="noopener noreferrer"
          target="_blank"
        ><span className="fa fa-question-circle"></span>&nbsp;Annotator User Guide</a>
      </span>
    );
  }

  renderInstructionsLink = () => {
    if (this.state.task && this.state.task.instructions_url) {
      return (
        <span>
          <a
            href={this.state.task.instructions_url}
            rel="noopener noreferrer"
            target="_blank"
          ><span className="fa fa-info-circle"></span>&nbsp;Campaign instructions</a>
        </span>
      );
    }
  }
}

export default AudioAnnotator;
