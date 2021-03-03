describe("유투브 검색 API를 이용하여 영상들을 검색할 수 있다.", () => {
  context("유저가 검색창에 검색어를 입력하고 클릭을 했을 때", () => {
    beforeEach(() => {
      cy.visit("/");
      cy.get("#search-button").click();
    });

    it("검색 결과가 없는 경우, 검색 결과 없음 이미지가 나타난다.", () => {
      cy.get(`.modal input[placeholder="검색"]`).type("./");
      cy.get(".modal button").contains("검색").click();
      cy.get(".modal .video-wrapper .clip").should("have.length", 0);
      cy.get(`.modal img[alt="not-found"]`).should("be.visible");
    });

    it("검색 결과가 있는 경우, 검색 결과가 나타난다.", () => {
      cy.get(`.modal input[placeholder="검색"]`).type("우아한테크코스");
      cy.get(".modal button").contains("검색").click();
      cy.get(".modal .video-wrapper .clip").should("have.length.least", 1);
    });
  });
});
