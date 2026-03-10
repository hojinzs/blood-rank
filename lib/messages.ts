export type BloodType = 'A' | 'B' | 'O' | 'AB';

export const getTitleCopy = (firstPlaceType: BloodType) => {
  switch (firstPlaceType) {
    case 'A': return 'A형은 역시 다정다감해';
    case 'B': return 'B형이 정말 이기적일까?';
    case 'O': return 'O형은 역시 열정이 달라';
    case 'AB': return 'AB형의 남다름은 여기서도';
  }
}

export const getCardCopy = (type: BloodType, rank: number) => {
  const matrix: Record<BloodType, Record<number, string>> = {
    A: {
      1: "역시 A형. 꼼꼼하게 챙길 건 다 챙기네요. 오늘은 인정합니다.",
      2: "A형 오늘 선방했어요. 근데 1위한텐 좀 배워요, 배려심 그쪽이 더 많은 거 아닌가요?",
      3: "A형 3위예요. 이러다 꼴찌 됩니다. 눈치 보는 거 여기선 하지 마요.",
      4: "A형이 이렇게 소심할 줄이야. 헌혈은 그냥 가면 되는데 왜 눈치 봐요?",
    },
    B: {
      1: "의외라고요? 아니요. B형은 하기로 하면 합니다. 오늘 그 날이에요.",
      2: "B형 2위. 1위도 할 수 있는데 왜 딱 거기서 멈춰요. 자기 페이스 타다가?",
      3: "B형 지금 자기 페이스로 가고 있죠? 근데 팀은 3위예요. 팀이 있긴 해요?",
      4: "B형은 역시 자기 피만 아끼는군요.",
    },
    O: {
      1: "역시 O형. 열정만으로 1위 해버렸네요. 단순한 게 장점일 때도 있어요.",
      2: "O형 2위. 리더가 1위는 해야 하는 거 아닌가요? 포용력으로 2위 받아들이기예요?",
      3: "O형 3위예요. 열정 어디 갔어요. 아까까지 있었잖아요.",
      4: "리더라면서요. 팀이 꼴찌인데 리더는 뭐해요?",
    },
    AB: {
      1: "오늘은 또 이런 날이네요. AB형은 알 수가 없어요, 좋은 의미로.",
      2: "AB형 2위. 어제는 꼴찌였는데 오늘은 2위예요. 그냥 기분 타는 건가요?",
      3: "AB형 3위예요. 합리적인 사람이 왜 지금 이 선택을 안 해요?",
      4: "AB형 오늘은 또 이런 날이군요. 헌혈 안 하는 기분인 거예요?",
    }
  };
  return matrix[type]?.[rank] || '';
}

export const getBloodTypeColor = (type: BloodType) => {
  switch (type) {
    case 'A': return 'bg-rose-500 text-white border-rose-600';
    case 'B': return 'bg-blue-500 text-white border-blue-600';
    case 'O': return 'bg-amber-500 text-white border-amber-600';
    case 'AB': return 'bg-purple-500 text-white border-purple-600';
  }
}
