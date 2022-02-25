/// <reference types="react-scripts" />

// window 객체에 메타마스크를 설치하면 이더리움 오브젝트가 생기는데 리액트에서는 인식하지 못함. 그래서 타입을 강제로 적어준다.
interface Window {
  ethereum: any;
}
