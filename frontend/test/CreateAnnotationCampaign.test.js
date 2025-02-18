import assert from 'assert';
import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import nock from 'nock';
import { mount, shallow } from 'enzyme';

import { ShowAnnotationSet } from '../src/CreateAnnotationCampaign';
import CreateAnnotationCampaign from '../src/CreateAnnotationCampaign';

import datasets from './fixtures/dataset_list.json';
import annotation_sets from './fixtures/annotation_set_list.json';
import users from './fixtures/user_list.json';

describe('testing ShowAnnotationSet component', function () {
    this.timeout(20000);
//TODO : fix unmount bug
    it('mounts properly with correct selections', () => {
        let choices = [
            { id: 1, name: 'A' },
            { id: 2, name: 'B', desc: 'Testing', tags: ['1', '2', '3'] },
            { id: 3, name: 'C' },
            { id: 4, name: 'D' }
        ];
        let onChange = () => null;
        let wrapper = mount(<ShowAnnotationSet annotation_sets={choices} onChange={onChange} />);
        let options = wrapper.find('option').map(option => { return option.text(); });
        assert.deepEqual(options, [ 'Select an annotation set', 'A', 'B', 'C', 'D' ]);
        assert.deepEqual(wrapper.find('div.border.rounded').length, 0);
        wrapper.setState({'selected': choices[1]});
        assert.deepEqual(wrapper.find('div.border.rounded').length, 1);
        assert.deepEqual(wrapper.find('div.border.rounded').text(), 'TestingTags: 1, 2, 3');
        //wrapper.unmount();
    });
});

describe('testing CreateAnnotationCampaign component', function () {
    this.timeout(20000);

    it('mounts properly with title', () => {
        let wrapper = mount(<CreateAnnotationCampaign />);
        assert(wrapper.text().includes('Create Annotation Campaign'), 'Title "Create Annotation Campaign" not found');
        //wrapper.unmount();
    });

    it('contains the info from the API calls', () => {
        nock(/.*/).get('/api/dataset/').reply(200, datasets);
        nock(/.*/).get('/api/annotation-set/').reply(200, annotation_sets);
        nock(/.*/).get('/api/user/').reply(200, users);
        let wrapper = mount(<CreateAnnotationCampaign />, { disableLifecycleMethods: true });
        return wrapper.instance().componentDidMount().then(() => {
            wrapper.update();
            let dataset_text = wrapper.find('#cac-dataset').text();
            datasets.forEach(dataset => {
                if (dataset.files_type === '.wav') {
                    assert(dataset_text.includes(dataset.name), dataset.name + ' not found');
                } else {
                    assert(!dataset_text.includes(dataset.name), dataset.name + ' should not be here');
                }
            })
            let as_text = wrapper.find('#cac-annotation-set').text();
            annotation_sets.forEach(annotation_set => {
                assert(as_text.includes(annotation_set.name), annotation_set.name + ' not found');
            })
            let user_text = wrapper.find('#cac-user').text();
            users.forEach(user => {
                assert(user_text.includes(user.email), user.email + ' not found');
            })
            //wrapper.unmount();
        });
    });

    it('sends the right fields and redirects on handleSubmit', () => {
        let expectedFields = [
            'name',
            'desc',
            'datasets',
            'annotation_set_id',
            'annotation_scope',
            'annotators',
            'annotation_goal',
            'annotation_method',
            'instructions_url'
        ];
        nock(/.*/).post('/api/annotation-campaign/', body => {
            expectedFields.forEach(field => {
                assert(field in body, 'POST request should have "' + field + '" field');
            });
            return true;
        }).reply(200);
        let history = [];
        let wrapper = mount(<CreateAnnotationCampaign history={history} />);
        return wrapper.instance().handleSubmit({preventDefault: () => null}).then(r => {
            assert.deepEqual(history, ['/annotation-campaigns']);
            //wrapper.unmount();
        });
    });

});
