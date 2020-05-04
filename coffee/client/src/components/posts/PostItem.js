import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';
import { connect } from 'react-redux';
// import { addLike, removeLike, deletePost } from '../../actions/post';

const PostItem = ({
  // // addLike,
  // // removeLike,
  // deletePost,
  auth,
  post: { _id, text, name, avatar, user, likes, comments, date, averageReview, totalReview},
  showActions
}) => {
  console.log("xxx", totalReview)
  return (
  <div className='post bg-white p-1 my-1'>
    <div>
      
      <p>shop name: <Link to={`/shops/${_id}`}> {text}</Link></p>
      <p className='post-date'>
        created cafe on <Moment format='YYYY/MM/DD'>{date}</Moment>
      </p>

      <div>average rate: {averageReview}</div>
      <div>total review number: {totalReview}</div>

   

      {/* {showActions && (
        <Fragment>
          <button
            onClick={() => addLike(_id)}
            type='button'
            className='btn btn-light'
          >
            <i className='fas fa-thumbs-up' />{' '}
            <span>{likes.length > 0 && <span>{likes.length}</span>}</span>
          </button>
          <button
            onClick={() => removeLike(_id)}
            type='button'
            className='btn btn-light'
          >
            <i className='fas fa-thumbs-down' />
          </button>
          <Link to={`/posts/${_id}`} className='btn btn-primary'>
            Discussion{' '}
            {comments.length > 0 && (
              <span className='comment-count'>{comments.length}</span>
            )}
          </Link>
          {!auth.loading && user === auth.user._id && (
            <button
              onClick={() => deletePost(_id)}
              type='button'
              className='btn btn-danger'
            >
              <i className='fas fa-times' />
            </button>
          )}
        </Fragment>
      )} */}
    </div>
  </div>
  )
}

PostItem.defaultProps = {
  showActions: true
};

PostItem.propTypes = {
  post: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  // addLike: PropTypes.func.isRequired,
  // removeLike: PropTypes.func.isRequired,
  // deletePost: PropTypes.func.isRequired,
  showActions: PropTypes.bool
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(
  mapStateToProps,
  // { addLike, removeLike, deletePost }
)(PostItem);
