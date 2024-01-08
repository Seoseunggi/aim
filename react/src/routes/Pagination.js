import React from "react";
import styled from "styled-components";

const PageUl = styled.ul`
  float: left;
  list-style: none;
  text-align: center;
  border-radius: 0px;
  color: white;
  padding: 0px;
  // border-top: 3px solid #186ead;
  // border-bottom: 3px solid #186ead;
  // background-color: rgba(0, 0, 0, 0.4);
`;

const PageLi = styled.li`
  display: inline-block;
  font-size: 10px;
  font-weight: 500;
  padding: 2px;
  border-radius: 0px;
  width: 45px;
  &:hover {
    cursor: pointer;
    color: white;
    //background-color: #263a6c;
  }
  &:focus::after {
    color: white;
    background-color: #263a6c;
  }
`;

const PageSpan = styled.span`
  &:hover::after,
  &:focus::after {
    border-radius: 0%;
    color: white;
    background-color: #ccc;
  }
`;

const Pagination = ({ postsPerPage, totalPosts, paginate }) => {
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(totalPosts / postsPerPage); i++) {
    pageNumbers.push(i);
  }
  return (
    <div>
      <nav>
        <PageUl className="pagination">
          {pageNumbers.map((number) => (
            <PageLi key={number} className="page-item">
              <PageSpan onClick={() => paginate(number)} className="page-link">
                {number}
              </PageSpan>
            </PageLi>
          ))}
        </PageUl>
      </nav>
    </div>
  );
};

export default Pagination;
