import http from 'k6/http';
import { check, group, sleep, fail } from 'k6';

export let options = {
  vus: 1,
  duration: '1m',

  thresholds: {
    http_req_duration: ['p(99)<100'], // 99% of requests must complete below 0.1s
  },
};

const BASE_URL = 'https://gyeom-subway-admin.kro.kr/';
const USERNAME = 'koreatech93@naver.com';
const PASSWORD = 'tkatkatka05)%';


export default function ()  {
    mainPage();
    const authHeaders = login();
    retrieveMember(authHeaders);
    pathPage();
    findPath(authHeaders);

    sleep(1);
}


function mainPage() {
    const response = http.get(BASE_URL);

    check(response, {
        'entered in main page successfully': (res) => res.status === 200
    });
}

function login() {
    const payload = JSON.stringify({
        email: USERNAME,
        password: PASSWORD,
    });
    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const response = http.post(`${BASE_URL}/login/token`, payload, params);

    check(response, {
        'logged in successfully': (res) => res.json('accessToken') !== '',
    });

    return {
        headers: {
            Authorization: `Bearer ${response.json('accessToken')}`,
        },
    };
}

function retrieveMember(authHeaders) {
    let myObjects = http.get(`${BASE_URL}/members/me`, authHeaders).json();
    check(myObjects, { 'retrieved member': (obj) => obj.id != 0 });
}

function pathPage() {
    const response = http.get(`${BASE_URL}/path`);

    check(response, {
        'entered in path page successfully': (res) => res.status === 200
    });
}

function findPath(authHeaders) {
    const response = http.get(`${BASE_URL}/path?source=3&target=4`, authHeaders);

    check(response, {
        'get path info successfully': (res) => res.status === 200
    });
}
